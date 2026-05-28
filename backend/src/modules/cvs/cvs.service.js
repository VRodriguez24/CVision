import { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';
import { errorCodes } from '../../errors/errorCodes.js';
import { prisma } from '../../lib/prisma.js';

const cvSummarySelect = {
  id: true,
  title: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

function notFoundError() {
  return new AppError('CV not found', {
    statusCode: 404,
    code: errorCodes.NOT_FOUND,
  });
}

export async function createCv(userId, { title, snapshot }) {
  const normalizedTitle = title.trim();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cv = await tx.cV.create({
        data: {
          userId,
          title: normalizedTitle,
          status: 'DRAFT',
        },
        select: cvSummarySelect,
      });

      await tx.cVVersion.create({
        data: {
          cvId: cv.id,
          versionNumber: 1,
          snapshot,
        },
      });

      return cv;
    });

    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('You already have a CV with this title', {
        statusCode: 409,
        code: errorCodes.CONFLICT,
      });
    }

    throw error;
  }
}

export async function listCvs(userId) {
  return prisma.cV.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    select: cvSummarySelect,
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

export async function getCvById(userId, cvId) {
  const cv = await prisma.cV.findFirst({
    where: {
      id: cvId,
      userId,
      deletedAt: null,
    },
    select: {
      ...cvSummarySelect,
      versions: {
        select: {
          versionNumber: true,
          snapshot: true,
        },
        orderBy: {
          versionNumber: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!cv || cv.versions.length === 0) {
    throw notFoundError();
  }

  const latestVersion = cv.versions[0];

  return {
    cv: {
      id: cv.id,
      title: cv.title,
      status: cv.status,
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt,
    },
    snapshot: latestVersion.snapshot,
    versionNumber: latestVersion.versionNumber,
  };
}

export async function updateCv(userId, cvId, { snapshot }) {
  return prisma.$transaction(async (tx) => {
    const cv = await tx.cV.findFirst({
      where: {
        id: cvId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!cv) {
      throw notFoundError();
    }

    const latestVersion = await tx.cVVersion.findFirst({
      where: { cvId },
      orderBy: {
        versionNumber: 'desc',
      },
      select: {
        versionNumber: true,
      },
    });

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

    await tx.cVVersion.create({
      data: {
        cvId,
        versionNumber: nextVersionNumber,
        snapshot,
      },
    });

    const updatedCv = await tx.cV.update({
      where: { id: cvId },
      data: {
        status: 'DRAFT',
      },
      select: cvSummarySelect,
    });

    return {
      cv: updatedCv,
      versionNumber: nextVersionNumber,
    };
  });
}

export async function renameCv(userId, cvId, { title }) {
  const normalizedTitle = title.trim();

  const cv = await prisma.cV.findFirst({
    where: {
      id: cvId,
      userId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!cv) {
    throw notFoundError();
  }

  try {
    return await prisma.cV.update({
      where: { id: cvId },
      data: {
        title: normalizedTitle,
      },
      select: cvSummarySelect,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('You already have a CV with this title', {
        statusCode: 409,
        code: errorCodes.CONFLICT,
      });
    }

    throw error;
  }
}

export async function deleteCv(userId, cvId) {
  const result = await prisma.cV.updateMany({
    where: {
      id: cvId,
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw notFoundError();
  }
}

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

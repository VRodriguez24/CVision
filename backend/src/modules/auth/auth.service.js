import { env } from '../../config/env.js';
import { AppError } from '../../errors/AppError.js';
import { errorCodes } from '../../errors/errorCodes.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { prisma } from '../../lib/prisma.js';
import { createJwt, createOpaqueToken, hashToken, verifyJwt } from '../../lib/token.js';

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function addMilliseconds(milliseconds) {
  return new Date(Date.now() + milliseconds);
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
  };
}

function resolveUserRole(email) {
  const normalizedEmail = email.toLowerCase();
  const adminDomains = ['@sence.cl', '@bne.cl', '@bne.c'];

  return adminDomains.some((domain) => normalizedEmail.endsWith(domain)) ? 'ADMIN' : 'USER';
}

function createAccessToken(user) {
  return createJwt(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  );
}

async function createRefreshToken(userId) {
  const refreshToken = createOpaqueToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: addMilliseconds(env.JWT_REFRESH_EXPIRES_IN * 1000),
    },
  });

  return refreshToken;
}

async function createEmailVerificationToken(userId) {
  const token = createOpaqueToken();

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: addMilliseconds(EMAIL_VERIFICATION_TTL_MS),
    },
  });

  return token;
}

async function createPasswordResetToken(userId) {
  const token = createOpaqueToken();

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: addMilliseconds(PASSWORD_RESET_TTL_MS),
    },
  });

  return token;
}

export async function register({ name, email, password, acceptedTerms, acceptedPrivacy, acceptedAiProcessing }, requestMeta = {}) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError('A user with this email already exists', {
      statusCode: 409,
      code: 'EMAIL_ALREADY_EXISTS',
    });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: resolveUserRole(email),
      status: 'PENDING_VERIFICATION',
      profile: {
        create: {},
      },
      consents: {
        create: [
          {
            type: 'TERMS',
            version: '2026-05',
            accepted: acceptedTerms,
            acceptedAt: new Date(),
            ipAddress: requestMeta.ipAddress,
            userAgent: requestMeta.userAgent,
          },
          {
            type: 'PRIVACY_POLICY',
            version: '2026-05',
            accepted: acceptedPrivacy,
            acceptedAt: new Date(),
            ipAddress: requestMeta.ipAddress,
            userAgent: requestMeta.userAgent,
          },
          {
            type: 'AI_PROCESSING',
            version: '2026-05',
            accepted: acceptedAiProcessing,
            acceptedAt: new Date(),
            ipAddress: requestMeta.ipAddress,
            userAgent: requestMeta.userAgent,
          },
        ],
      },
    },
  });

  const verificationToken = await createEmailVerificationToken(user.id);

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'AUTH_REGISTER',
      entityType: 'User',
      entityId: user.id,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    },
  });

  return {
    user: publicUser(user),
    verificationToken,
    requiresEmailVerification: true,
  };
}

export async function login({ email, password }, requestMeta = {}) {
  const user = await prisma.user.findUnique({ where: { email } });
  const validPassword = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !validPassword) {
    throw new AppError('Invalid email or password', {
      statusCode: 401,
      code: errorCodes.UNAUTHORIZED,
    });
  }

  if (user.status === 'PENDING_VERIFICATION') {
    throw new AppError('Email verification is required before login', {
      statusCode: 403,
      code: 'EMAIL_VERIFICATION_REQUIRED',
    });
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('User account is not active', {
      statusCode: 403,
      code: 'ACCOUNT_NOT_ACTIVE',
    });
  }

  const [accessToken, refreshToken] = await Promise.all([
    Promise.resolve(createAccessToken(user)),
    createRefreshToken(user.id),
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'AUTH_LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
      },
    }),
  ]);

  return {
    user: publicUser(user),
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  };
}

export async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date() || storedToken.user.status !== 'ACTIVE') {
    throw new AppError('Invalid or expired refresh token', {
      statusCode: 401,
      code: errorCodes.UNAUTHORIZED,
    });
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const nextRefreshToken = await createRefreshToken(storedToken.userId);

  return {
    user: publicUser(storedToken.user),
    accessToken: createAccessToken(storedToken.user),
    refreshToken: nextRefreshToken,
    tokenType: 'Bearer',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  };
}

export async function logout(refreshToken, userId, requestMeta = {}) {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: 'AUTH_LOGOUT',
      entityType: 'User',
      entityId: userId,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    },
  });
}

export async function verifyEmail(token, requestMeta = {}) {
  const tokenHash = hashToken(token);
  const storedToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired verification token', {
      statusCode: 400,
      code: 'INVALID_VERIFICATION_TOKEN',
    });
  }

  const user = await prisma.user.update({
    where: { id: storedToken.userId },
    data: {
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      emailTokens: {
        update: {
          where: { id: storedToken.id },
          data: { usedAt: new Date() },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'AUTH_VERIFY_EMAIL',
      entityType: 'User',
      entityId: user.id,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    },
  });

  return { user: publicUser(user) };
}

export async function forgotPassword(email, requestMeta = {}) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { accepted: true };
  }

  const resetToken = await createPasswordResetToken(user.id);

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'AUTH_FORGOT_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    },
  });

  return {
    accepted: true,
    resetToken,
  };
}

export async function resetPassword({ token, password }, requestMeta = {}) {
  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired password reset token', {
      statusCode: 400,
      code: 'INVALID_PASSWORD_RESET_TOKEN',
    });
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: storedToken.userId },
    data: {
      passwordHash,
      refreshTokens: {
        updateMany: {
          where: { revokedAt: null },
          data: { revokedAt: new Date() },
        },
      },
      passwordTokens: {
        update: {
          where: { id: storedToken.id },
          data: { usedAt: new Date() },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: storedToken.userId,
      action: 'AUTH_RESET_PASSWORD',
      entityType: 'User',
      entityId: storedToken.userId,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    },
  });

  return { updated: true };
}

export function decodeAccessToken(token) {
  return verifyJwt(token, { secret: env.JWT_ACCESS_SECRET });
}

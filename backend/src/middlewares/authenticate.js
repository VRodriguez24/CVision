import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { errorCodes } from '../errors/errorCodes.js';
import { prisma } from '../lib/prisma.js';
import { verifyJwt } from '../lib/token.js';

export async function authenticate(request, _response, next) {
  try {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      throw new AppError('Authentication token is required', {
        statusCode: 401,
        code: errorCodes.UNAUTHORIZED,
      });
    }

    const payload = verifyJwt(token, { secret: env.JWT_ACCESS_SECRET });

    if (!payload?.sub) {
      throw new AppError('Invalid or expired authentication token', {
        statusCode: 401,
        code: errorCodes.UNAUTHORIZED,
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('User account is not active', {
        statusCode: 401,
        code: errorCodes.UNAUTHORIZED,
      });
    }

    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

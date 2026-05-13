import { AppError } from '../errors/AppError.js';
import { errorCodes } from '../errors/errorCodes.js';

export function authorize(...roles) {
  return (request, _response, next) => {
    if (!request.user) {
      return next(
        new AppError('Authentication is required', {
          statusCode: 401,
          code: errorCodes.UNAUTHORIZED,
        }),
      );
    }

    if (!roles.includes(request.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', {
          statusCode: 403,
          code: errorCodes.FORBIDDEN,
        }),
      );
    }

    return next();
  };
}

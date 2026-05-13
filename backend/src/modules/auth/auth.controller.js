import * as authService from './auth.service.js';

function requestMeta(request) {
  return {
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  };
}

export async function register(request, response, next) {
  try {
    const result = await authService.register(request.validated.body, requestMeta(request));
    response.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(request, response, next) {
  try {
    const result = await authService.login(request.validated.body, requestMeta(request));
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function refresh(request, response, next) {
  try {
    const result = await authService.refresh(request.validated.body.refreshToken);
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(request, response, next) {
  try {
    await authService.logout(request.body?.refreshToken, request.user.id, requestMeta(request));
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(request, response, next) {
  try {
    const result = await authService.verifyEmail(request.validated.body.token, requestMeta(request));
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(request, response, next) {
  try {
    const result = await authService.forgotPassword(request.validated.body.email, requestMeta(request));
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(request, response, next) {
  try {
    const result = await authService.resetPassword(request.validated.body, requestMeta(request));
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

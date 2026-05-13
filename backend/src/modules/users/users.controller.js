import * as usersService from './users.service.js';

export async function me(request, response, next) {
  try {
    const user = await usersService.getMe(request.user.id);
    response.json({ data: { user } });
  } catch (error) {
    next(error);
  }
}

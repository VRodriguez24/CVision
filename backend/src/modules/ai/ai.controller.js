import * as aiService from './ai.service.js';

export async function improveField(request, response, next) {
  try {
    const result = await aiService.improveField(request.validated.body);
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function analyzeCv(request, response, next) {
  try {
    const result = await aiService.analyzeCv(request.validated.body);
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

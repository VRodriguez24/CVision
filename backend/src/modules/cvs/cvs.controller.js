import * as cvsService from './cvs.service.js';

export async function createCv(request, response, next) {
  try {
    const cv = await cvsService.createCv(request.user.id, request.validated.body);
    response.status(201).json({ data: { cv } });
  } catch (error) {
    next(error);
  }
}

export async function listCvs(request, response, next) {
  try {
    const cvs = await cvsService.listCvs(request.user.id);
    response.json({ data: { cvs } });
  } catch (error) {
    next(error);
  }
}

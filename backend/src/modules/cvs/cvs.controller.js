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

export async function getCvById(request, response, next) {
  try {
    const result = await cvsService.getCvById(request.user.id, request.validated.params.cvId);
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateCv(request, response, next) {
  try {
    const result = await cvsService.updateCv(request.user.id, request.validated.params.cvId, request.validated.body);
    response.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function renameCv(request, response, next) {
  try {
    const cv = await cvsService.renameCv(request.user.id, request.validated.params.cvId, request.validated.body);
    response.json({ data: { cv } });
  } catch (error) {
    next(error);
  }
}

export async function deleteCv(request, response, next) {
  try {
    await cvsService.deleteCv(request.user.id, request.validated.params.cvId);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

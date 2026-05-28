import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import * as cvsController from './cvs.controller.js';
import { createCvSchema, cvIdParamSchema, renameCvSchema, updateCvSchema } from './cvs.validator.js';

export const cvsRoutes = Router();

cvsRoutes.use(authenticate);
cvsRoutes.post('/', validate(createCvSchema), cvsController.createCv);
cvsRoutes.get('/', cvsController.listCvs);
cvsRoutes.get('/:cvId', validate(cvIdParamSchema), cvsController.getCvById);
cvsRoutes.put('/:cvId', validate(updateCvSchema), cvsController.updateCv);
cvsRoutes.patch('/:cvId', validate(renameCvSchema), cvsController.renameCv);
cvsRoutes.delete('/:cvId', validate(cvIdParamSchema), cvsController.deleteCv);

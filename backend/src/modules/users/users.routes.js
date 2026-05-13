import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import * as usersController from './users.controller.js';

export const usersRoutes = Router();

usersRoutes.get('/me', authenticate, usersController.me);

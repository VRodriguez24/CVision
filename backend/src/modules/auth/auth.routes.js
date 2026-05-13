import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import * as authController from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validator.js';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), authController.register);
authRoutes.post('/login', validate(loginSchema), authController.login);
authRoutes.post('/refresh', validate(refreshSchema), authController.refresh);
authRoutes.post('/logout', authenticate, authController.logout);
authRoutes.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
authRoutes.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
authRoutes.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

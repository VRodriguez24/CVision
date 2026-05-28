import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { cvsRoutes } from '../modules/cvs/cvs.routes.js';
import { healthRoutes } from '../modules/health/health.routes.js';
import { usersRoutes } from '../modules/users/users.routes.js';

export const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/cvs', cvsRoutes);
apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/users', usersRoutes);

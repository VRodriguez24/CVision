import { env } from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map((item) => item.trim());
    const isLocalViteDev = env.NODE_ENV === 'development' && /^http:\/\/localhost:51\d{2}$/.test(origin ?? '');

    if (!origin || allowedOrigins.includes(origin) || isLocalViteDev) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
};

import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import { apiV1Router } from './src/backend/routes';
import { errorHandler } from './src/backend/middleware/errorHandler';
import { requestIdMiddleware } from './src/backend/middleware/requestId';
import { logger } from './src/backend/utils/logger';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & parser middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      xFrameOptions: false,
    })
  );
  // CORS hardening
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : [];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin SPA)
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy rejection: Origin not allowed.'));
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(requestIdMiddleware);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'LEXFLOW Legal Intelligence Engine',
      version: '1.0.0',
    });
  });

  // API v1 routes FIRST
  app.use('/api/v1', apiV1Router);

  // Global error handler for API
  app.use(errorHandler);

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`LEXFLOW Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

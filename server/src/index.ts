import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/authRoutes';
import moodRoutes from './routes/moodRoutes';
import surveyRoutes from './routes/surveyRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import counselorRoutes from './routes/counselorRoutes';
import messageRoutes from './routes/messageRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import feedbackRoutes from './routes/feedbackRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles and external fonts/icons
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Health & System Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'MindTrack Student Mental Health & Wellness Monitoring API',
    timestamp: new Date().toISOString(),
    disclaimer: 'For student wellness monitoring & screening support only. Not a medical diagnostic tool.',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/counselor', counselorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);

// Static assets from Client Production Build
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API routes
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌿 MindTrack Server is running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    if (fs.existsSync(clientDistPath)) {
      console.log(`✨ Serving compiled frontend web app from ${clientDistPath}`);
    }
  });
}

export default app;

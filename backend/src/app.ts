import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/AppError';
import logger from './utils/logger';

// Import all routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import announcementRoutes from './modules/announcements/announcement.routes';
import complaintRoutes from './modules/complaints/complaint.routes';
import eventRoutes from './modules/event/event.routes';
import paymentRoutes from './modules/payments/payment.routes';
import visitorRoutes from './modules/visitors/visitor.routes';
import facilityRoutes from './modules/facilities/facility.routes';
import emergencyRoutes from './modules/emergency/emergency.routes';
import pollRoutes from './modules/polls/poll.routes';
import notificationRoutes from './modules/notifications/notification.routes';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/polls', pollRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Error handler
app.use(errorHandler);

export default app;
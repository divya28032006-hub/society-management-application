import express from 'express';
import { NotificationController } from './notification.controller';
import { protect, restrictToAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createNotificationValidation,
  createBulkNotificationValidation,
  getNotificationsValidation,
  markAsReadValidation,
  markAllAsReadValidation,
  deleteNotificationValidation,
  getNotificationByIdValidation
} from './notification.validators';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============ USER NOTIFICATION ROUTES ============

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Get all notifications for current user
router.get(
  '/',
  validate(getNotificationsValidation),
  NotificationController.getMyNotifications
);

// Get notification by ID
router.get(
  '/:id',
  validate(getNotificationByIdValidation),
  NotificationController.getNotificationById
);

// Mark notification as read
router.post(
  '/:id/read',
  validate(markAsReadValidation),
  NotificationController.markAsRead
);

// Mark all notifications as read
router.post(
  '/mark-all-read',
  validate(markAllAsReadValidation),
  NotificationController.markAllAsRead
);

// Delete notification
router.delete(
  '/:id',
  validate(deleteNotificationValidation),
  NotificationController.deleteNotification
);

// Delete all notifications
router.delete('/all', NotificationController.deleteAllNotifications);

// ============ ADMIN NOTIFICATION ROUTES ============

// Get notification statistics (admin only)
router.get(
  '/admin/stats',
  restrictToAdmin,
  NotificationController.getStats
);

// Get all society notifications (admin only)
router.get(
  '/admin/all',
  restrictToAdmin,
  validate(getNotificationsValidation),
  NotificationController.getSocietyNotifications
);

// Create notification for specific user (admin only)
router.post(
  '/admin/create',
  restrictToAdmin,
  validate(createNotificationValidation),
  NotificationController.createForUser
);

// Create bulk notifications (admin only)
router.post(
  '/admin/bulk',
  restrictToAdmin,
  validate(createBulkNotificationValidation),
  NotificationController.createBulk
);

// Send to all residents (admin only)
router.post(
  '/admin/send-to-all',
  restrictToAdmin,
  NotificationController.sendToAllResidents
);

// Send to admins (admin only)
router.post(
  '/admin/send-to-admins',
  restrictToAdmin,
  NotificationController.sendToAdmins
);

export default router;
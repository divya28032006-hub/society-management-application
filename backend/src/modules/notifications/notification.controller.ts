import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/apiResponse';

export class NotificationController {
  /**
   * Get current user's notifications
   */
  static getMyNotifications = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isRead = req.query.isRead === 'true' ? true : 
                   req.query.isRead === 'false' ? false : undefined;
    const type = req.query.type as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const { notifications, total, unreadCount } = await NotificationService.getUserNotifications(
      req.user.id,
      page,
      limit,
      { isRead, type, startDate, endDate }
    );

    sendPaginatedSuccess(
      res,
      { notifications, unreadCount },
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      'Notifications retrieved successfully'
    );
  });

  /**
   * Get unread notification count
   */
  static getUnreadCount = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const count = await NotificationService.getUnreadCount(req.user.id);
    sendSuccess(res, { unreadCount: count }, 'Unread count retrieved successfully');
  });

  /**
   * Get notification by ID
   */
  static getNotificationById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const notification = await NotificationService.getNotificationById(
      req.params.id,
      req.user.id
    );

    sendSuccess(res, { notification }, 'Notification retrieved successfully');
  });

  /**
   * Mark a notification as read
   */
  static markAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    sendSuccess(res, { notification }, 'Notification marked as read successfully');
  });

  /**
   * Mark all notifications as read
   */
  static markAllAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const result = await NotificationService.markAllAsRead(req.user.id);
    sendSuccess(res, result, 'All notifications marked as read successfully');
  });

  /**
   * Delete a notification
   */
  static deleteNotification = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await NotificationService.deleteNotification(req.params.id, req.user.id);
    sendSuccess(res, null, 'Notification deleted successfully', 204);
  });

  /**
   * Delete all notifications
   */
  static deleteAllNotifications = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const result = await NotificationService.deleteAllNotifications(req.user.id);
    sendSuccess(res, result, 'All notifications deleted successfully');
  });

  // ============ ADMIN CONTROLLERS ============

  /**
   * Create notification for a specific user (admin only)
   */
  static createForUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can create notifications', 403);
    }

    const notification = await NotificationService.createNotification(
      req.body,
      req.user.society.toString()
    );

    sendSuccess(res, { notification }, 'Notification created successfully', 201);
  });

  /**
   * Create bulk notifications (admin only)
   */
  static createBulk = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can create bulk notifications', 403);
    }

    const { notifications, count } = await NotificationService.createBulkNotifications(
      req.body,
      req.user.society.toString()
    );

    sendSuccess(
      res,
      { notifications, count },
      `Bulk notifications created successfully for ${count} users`,
      201
    );
  });

  /**
   * Send notification to all residents (admin only)
   */
  static sendToAllResidents = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can send notifications to all residents', 403);
    }

    const { title, message, type, link, metadata } = req.body;

    if (!title || !message) {
      throw new AppError('Title and message are required', 400);
    }

    const result = await NotificationService.sendToAllResidents(
      { title, message, type, link, metadata },
      req.user.society.toString()
    );

    sendSuccess(
      res,
      result,
      `Notification sent to all residents successfully (${result.count} residents)`,
      201
    );
  });

  /**
   * Send notification to all admins (admin only)
   */
  static sendToAdmins = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can send notifications to admins', 403);
    }

    const { title, message, type, link, metadata } = req.body;

    if (!title || !message) {
      throw new AppError('Title and message are required', 400);
    }

    const result = await NotificationService.sendToAdmins(
      { title, message, type, link, metadata },
      req.user.society.toString()
    );

    sendSuccess(
      res,
      result,
      `Notification sent to admins successfully (${result.count} admins)`,
      201
    );
  });

  /**
   * Get notification statistics (admin only)
   */
  static getStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can view notification statistics', 403);
    }

    const stats = await NotificationService.getNotificationStats(
      req.user.society.toString()
    );

    sendSuccess(res, stats, 'Notification statistics retrieved successfully');
  });

  /**
   * Get all society notifications (admin only)
   */
  static getSocietyNotifications = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can view all society notifications', 403);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isRead = req.query.isRead === 'true' ? true : 
                   req.query.isRead === 'false' ? false : undefined;
    const type = req.query.type as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const { notifications, total } = await NotificationService.getSocietyNotifications(
      req.user.society.toString(),
      page,
      limit,
      { isRead, type, startDate, endDate }
    );

    sendPaginatedSuccess(
      res,
      { notifications },
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      'Society notifications retrieved successfully'
    );
  });
}
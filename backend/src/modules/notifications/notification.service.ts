import { Notification, INotification } from '../../models/Notification';
import { User } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger, { logInfo, logError } from '../../utils/logger';
import { Types } from 'mongoose';

interface CreateNotificationInput {
  title: string;
  message: string;
  userId: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  metadata?: Record<string, any>;
}

interface CreateBulkNotificationInput {
  userIds: string[];
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  metadata?: Record<string, any>;
}

interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}

export class NotificationService {
  /**
   * Create a single notification for a user
   */
  static async createNotification(
    input: CreateNotificationInput,
    societyId: string
  ): Promise<INotification> {
    try {
      // Check if user exists
      const user = await User.findById(input.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Create notification
      const notification = await Notification.create({
        ...input,
        user: input.userId,
        society: societyId,
        isRead: false
      });

      // Populate user details
      await notification.populate('user', 'name email');

      logInfo('NotificationService', `Notification created for user ${input.userId}`, {
        title: input.title,
        notificationId: notification._id
      });

      return notification;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('NotificationService', error as Error, { input, societyId });
      throw new AppError('Failed to create notification', 500);
    }
  }

  /**
   * Create bulk notifications for multiple users
   */
  static async createBulkNotifications(
    input: CreateBulkNotificationInput,
    societyId: string
  ): Promise<{ notifications: INotification[]; count: number }> {
    try {
      // Validate all users exist
      const users = await User.find({
        _id: { $in: input.userIds },
        isActive: true
      });

      if (users.length === 0) {
        throw new AppError('No valid users found', 404);
      }

      const validUserIds = users.map(u => u._id.toString());

      // Create notifications for all valid users
      const notifications = await Notification.insertMany(
        validUserIds.map(userId => ({
          title: input.title,
          message: input.message,
          type: input.type || 'info',
          link: input.link,
          metadata: input.metadata,
          user: new Types.ObjectId(userId),
          society: new Types.ObjectId(societyId),
          isRead: false
        }))
      );

      logInfo('NotificationService', `Bulk notifications created for ${notifications.length} users`, {
        title: input.title,
        count: notifications.length
      });

      return {
        notifications,
        count: notifications.length
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('NotificationService', error as Error, { input, societyId });
      throw new AppError('Failed to create bulk notifications', 500);
    }
  }

  /**
   * Get notifications for a user with pagination and filters
   */
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    try {
      const query: any = { user: new Types.ObjectId(userId) };

      if (filters.isRead !== undefined) {
        query.isRead = filters.isRead;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }

      const skip = (page - 1) * limit;

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email'),
        Notification.countDocuments(query),
        Notification.countDocuments({ 
          user: new Types.ObjectId(userId), 
          isRead: false 
        })
      ]);

      return { notifications, total, unreadCount };
    } catch (error) {
      logError('NotificationService', error as Error, { userId, filters });
      throw new AppError('Failed to get notifications', 500);
    }
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(
    id: string,
    userId: string
  ): Promise<INotification> {
    try {
      const notification = await Notification.findOne({
        _id: id,
        user: new Types.ObjectId(userId)
      }).populate('user', 'name email');

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      return notification;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('NotificationService', error as Error, { id, userId });
      throw new AppError('Failed to get notification', 500);
    }
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: string, userId: string): Promise<INotification> {
    try {
      const notification = await Notification.findOne({
        _id: id,
        user: new Types.ObjectId(userId)
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      if (notification.isRead) {
        throw new AppError('Notification is already marked as read', 400);
      }

      notification.isRead = true;
      await notification.save();

      logInfo('NotificationService', `Notification marked as read: ${id}`, { userId });
      return notification;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('NotificationService', error as Error, { id, userId });
      throw new AppError('Failed to mark notification as read', 500);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    try {
      const result = await Notification.updateMany(
        { user: new Types.ObjectId(userId), isRead: false },
        { isRead: true }
      );

      logInfo('NotificationService', `Marked ${result.modifiedCount} notifications as read`, { userId });
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      logError('NotificationService', error as Error, { userId });
      throw new AppError('Failed to mark notifications as read', 500);
    }
  }

  /**
   * Delete a single notification
   */
  static async deleteNotification(id: string, userId: string): Promise<void> {
    try {
      const notification = await Notification.findOne({
        _id: id,
        user: new Types.ObjectId(userId)
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      await notification.deleteOne();
      logInfo('NotificationService', `Notification deleted: ${id}`, { userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('NotificationService', error as Error, { id, userId });
      throw new AppError('Failed to delete notification', 500);
    }
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(userId: string): Promise<{ deletedCount: number }> {
    try {
      const result = await Notification.deleteMany({
        user: new Types.ObjectId(userId)
      });

      logInfo('NotificationService', `Deleted ${result.deletedCount} notifications`, { userId });
      return { deletedCount: result.deletedCount };
    } catch (error) {
      logError('NotificationService', error as Error, { userId });
      throw new AppError('Failed to delete notifications', 500);
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await Notification.countDocuments({
        user: new Types.ObjectId(userId),
        isRead: false
      });

      return count;
    } catch (error) {
      logError('NotificationService', error as Error, { userId });
      throw new AppError('Failed to get unread count', 500);
    }
  }

  /**
   * Get notifications for a specific society (admin only)
   */
  static async getSocietyNotifications(
    societyId: string,
    page: number = 1,
    limit: number = 10,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      const query: any = { society: new Types.ObjectId(societyId) };

      if (filters.isRead !== undefined) {
        query.isRead = filters.isRead;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }

      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email flatNumber')
          .populate('society', 'name'),
        Notification.countDocuments(query)
      ]);

      return { notifications, total };
    } catch (error) {
      logError('NotificationService', error as Error, { societyId, filters });
      throw new AppError('Failed to get society notifications', 500);
    }
  }

  /**
   * Get notification statistics for a society (admin only)
   */
  static async getNotificationStats(societyId: string): Promise<any> {
    try {
      const total = await Notification.countDocuments({
        society: new Types.ObjectId(societyId)
      });

      const unread = await Notification.countDocuments({
        society: new Types.ObjectId(societyId),
        isRead: false
      });

      const read = await Notification.countDocuments({
        society: new Types.ObjectId(societyId),
        isRead: true
      });

      const byType = await Notification.aggregate([
        { $match: { society: new Types.ObjectId(societyId) } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayNotifications = await Notification.countDocuments({
        society: new Types.ObjectId(societyId),
        createdAt: { $gte: today }
      });

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const lastWeekNotifications = await Notification.countDocuments({
        society: new Types.ObjectId(societyId),
        createdAt: { $gte: lastWeek }
      });

      return {
        total,
        unread,
        read,
        today: todayNotifications,
        lastWeek: lastWeekNotifications,
        byType
      };
    } catch (error) {
      logError('NotificationService', error as Error, { societyId });
      throw new AppError('Failed to get notification statistics', 500);
    }
  }

  /**
   * Send notification to all residents of a society
   */
  static async sendToAllResidents(
    input: Omit<CreateNotificationInput, 'userId'>,
    societyId: string
  ): Promise<{ notifications: INotification[]; count: number }> {
    try {
      // Get all active residents
      const residents = await User.find({
        society: new Types.ObjectId(societyId),
        isActive: true
      }).select('_id');

      if (residents.length === 0) {
        throw new AppError('No active residents found in this society', 404);
      }

      const userIds = residents.map(r => r._id.toString());

      const result = await this.createBulkNotifications(
        {
          userIds,
          title: input.title,
          message: input.message,
          type: input.type,
          link: input.link,
          metadata: input.metadata
        },
        societyId
      );

      logInfo('NotificationService', `Sent notification to all residents (${result.count})`, {
        societyId,
        count: result.count
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('NotificationService', error as Error, { input, societyId });
      throw new AppError('Failed to send notification to all residents', 500);
    }
  }

  /**
   * Send notification to all admins of a society
   */
  static async sendToAdmins(
    input: Omit<CreateNotificationInput, 'userId'>,
    societyId: string
  ): Promise<{ notifications: INotification[]; count: number }> {
    try {
      // Get all admins
      const admins = await User.find({
        society: new Types.ObjectId(societyId),
        role: 'admin',
        isActive: true
      }).select('_id');

      if (admins.length === 0) {
        throw new AppError('No active admins found in this society', 404);
      }

      const userIds = admins.map(r => r._id.toString());

      const result = await this.createBulkNotifications(
        {
          userIds,
          title: input.title,
          message: input.message,
          type: input.type,
          link: input.link,
          metadata: input.metadata
        },
        societyId
      );

      logInfo('NotificationService', `Sent notification to admins (${result.count})`, {
        societyId,
        count: result.count
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('NotificationService', error as Error, { input, societyId });
      throw new AppError('Failed to send notification to admins', 500);
    }
  }
}
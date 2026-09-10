import { Announcement, AnnouncementCategory, IAnnouncement } from '../../models/Announcement';
import { User } from '../../models/User';
import { NotificationService } from '../notifications/notification.service';
import { AppError } from '../../utils/AppError';
import { Types } from 'mongoose';
import logger from '../../utils/logger';

interface CreateAnnouncementInput {
  title: string;
  content: string;
  category: AnnouncementCategory;
  author: string;
  pinned?: boolean;
  expiresAt?: Date;
}

interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  category?: AnnouncementCategory;
  pinned?: boolean;
  expiresAt?: Date;
}

export class AnnouncementService {
  static async createAnnouncement(input: CreateAnnouncementInput): Promise<IAnnouncement> {
    try {
      const announcement = await Announcement.create({
        ...input,
        author: new Types.ObjectId(input.author)
      });

      // Populate author details
      await announcement.populate('author', 'name email role society');

      const authorUser = await User.findById(input.author);
      if (authorUser && authorUser.society) {
        try {
          await NotificationService.sendToAllResidents(
            {
              title: `New Notice: ${announcement.title}`,
              message: announcement.content.length > 100 ? `${announcement.content.substring(0, 100)}...` : announcement.content,
              type: 'info',
              metadata: { announcementId: announcement._id }
            },
            authorUser.society.toString()
          );
        } catch (notifErr) {
          logger.error('Failed to dispatch announcement notification:', notifErr);
        }
      }

      logger.info(`Announcement created: ${announcement.title} by ${input.author}`);
      return announcement;
    } catch (error) {
      logger.error('Create announcement error:', error);
      throw new AppError('Failed to create announcement', 500);
    }
  }

  static async getAllAnnouncements(
    page: number = 1,
    limit: number = 10,
    category?: AnnouncementCategory,
    search?: string
  ): Promise<{ announcements: IAnnouncement[]; total: number }> {
    try {
      const query: any = {};
      
      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [announcements, total] = await Promise.all([
        Announcement.find(query)
          .sort({ pinned: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'name email role'),
        Announcement.countDocuments(query)
      ]);

      return { announcements, total };
    } catch (error) {
      logger.error('Get announcements error:', error);
      throw new AppError('Failed to get announcements', 500);
    }
  }

  static async getAnnouncementById(id: string): Promise<IAnnouncement> {
    try {
      const announcement = await Announcement.findById(id)
        .populate('author', 'name email role')
        .populate('readBy', 'name email');

      if (!announcement) {
        throw new AppError('Announcement not found', 404);
      }

      return announcement;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get announcement error:', error);
      throw new AppError('Failed to get announcement', 500);
    }
  }

  static async updateAnnouncement(
    id: string,
    userId: string,
    input: UpdateAnnouncementInput
  ): Promise<IAnnouncement> {
    try {
      const announcement = await Announcement.findById(id);
      
      if (!announcement) {
        throw new AppError('Announcement not found', 404);
      }

      // Check if user is author or admin
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (announcement.author.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to update this announcement', 403);
      }

      Object.assign(announcement, input);
      await announcement.save();

      await announcement.populate('author', 'name email role');

      logger.info(`Announcement updated: ${announcement.title} by ${userId}`);
      return announcement;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update announcement error:', error);
      throw new AppError('Failed to update announcement', 500);
    }
  }

  static async deleteAnnouncement(id: string, userId: string): Promise<void> {
    try {
      const announcement = await Announcement.findById(id);
      
      if (!announcement) {
        throw new AppError('Announcement not found', 404);
      }

      // Check if user is author or admin
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (announcement.author.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to delete this announcement', 403);
      }

      await announcement.deleteOne();
      logger.info(`Announcement deleted: ${announcement.title} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete announcement error:', error);
      throw new AppError('Failed to delete announcement', 500);
    }
  }

  static async markAsRead(announcementId: string, userId: string): Promise<IAnnouncement> {
    try {
      const announcement = await Announcement.findById(announcementId);
      
      if (!announcement) {
        throw new AppError('Announcement not found', 404);
      }

      if (!announcement.readBy.includes(new Types.ObjectId(userId))) {
        announcement.readBy.push(new Types.ObjectId(userId));
        await announcement.save();
      }

      return announcement;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Mark as read error:', error);
      throw new AppError('Failed to mark announcement as read', 500);
    }
  }
}
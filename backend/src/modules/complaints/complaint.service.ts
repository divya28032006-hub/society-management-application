import { Complaint, IComplaint, ComplaintStatus, ComplaintPriority } from '../../models/Complaint';
import { User } from '../../models/User';
import { NotificationService } from '../notifications/notification.service';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
  priority?: ComplaintPriority;
  raisedBy: string;
  attachments?: string[];
}

interface UpdateComplaintInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: ComplaintPriority;
  status?: ComplaintStatus;
  assignedTo?: string;
  resolvedAt?: Date;
}

interface CommentInput {
  text: string;
  userId: string;
}

export class ComplaintService {
  static async createComplaint(input: CreateComplaintInput, societyId: string): Promise<IComplaint> {
    try {
      const complaint = await Complaint.create({
        ...input,
        raisedBy: new Types.ObjectId(input.raisedBy),
        society: new Types.ObjectId(societyId),
        status: ComplaintStatus.PENDING
      });

      await complaint.populate('raisedBy', 'name email flatNumber');
      
      logger.info(`Complaint created: ${complaint.title} by ${input.raisedBy}`);
      return complaint;
    } catch (error) {
      logger.error('Create complaint error:', error);
      throw new AppError('Failed to create complaint', 500);
    }
  }

  static async getComplaints(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    filters: any = {},
    societyId?: string
  ): Promise<{ complaints: IComplaint[]; total: number }> {
    try {
      const query: any = societyId ? { society: new Types.ObjectId(societyId) } : {};

      if (userRole !== 'admin') {
        query.raisedBy = new Types.ObjectId(userId);
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [complaints, total] = await Promise.all([
        Complaint.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('raisedBy', 'name email flatNumber')
          .populate('assignedTo', 'name email'),
        Complaint.countDocuments(query)
      ]);

      return { complaints, total };
    } catch (error) {
      logger.error('Get complaints error:', error);
      throw new AppError('Failed to get complaints', 500);
    }
  }

  static async getComplaintById(id: string): Promise<IComplaint> {
    try {
      const complaint = await Complaint.findById(id)
        .populate('raisedBy', 'name email flatNumber phone')
        .populate('assignedTo', 'name email phone')
        .populate('comments.user', 'name email role');

      if (!complaint) {
        throw new AppError('Complaint not found', 404);
      }

      return complaint;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get complaint error:', error);
      throw new AppError('Failed to get complaint', 500);
    }
  }

  static async updateComplaint(
    id: string,
    input: UpdateComplaintInput,
    userId: string,
    userRole: string
  ): Promise<IComplaint> {
    try {
      const complaint = await Complaint.findById(id);
      if (!complaint) {
        throw new AppError('Complaint not found', 404);
      }

      // Check permissions
      if (complaint.raisedBy.toString() !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to update this complaint', 403);
      }

      const previousStatus = complaint.status;

      // If status is being changed to resolved
      if (input.status === ComplaintStatus.RESOLVED && complaint.status !== ComplaintStatus.RESOLVED) {
        input = { ...input, resolvedAt: new Date() };
      }

      Object.assign(complaint, input);
      await complaint.save();

      // Trigger notification if status changed
      if (input.status && input.status !== previousStatus) {
        try {
          await NotificationService.createNotification(
            {
              title: `Complaint Status Updated: ${complaint.title}`,
              message: `Your complaint status has been updated to ${input.status.toUpperCase().replace('_', ' ')}.`,
              userId: complaint.raisedBy.toString(),
              type: input.status === ComplaintStatus.RESOLVED ? 'success' : 'info',
              metadata: { complaintId: complaint._id }
            },
            complaint.society.toString()
          );
        } catch (notifErr) {
          logger.error('Failed to send complaint status notification:', notifErr);
        }
      }

      await complaint.populate('raisedBy', 'name email flatNumber');
      await complaint.populate('assignedTo', 'name email');

      logger.info(`Complaint updated: ${id} by ${userId}`);
      return complaint;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update complaint error:', error);
      throw new AppError('Failed to update complaint', 500);
    }
  }

  static async addComment(
    id: string,
    input: CommentInput
  ): Promise<IComplaint> {
    try {
      const complaint = await Complaint.findById(id);
      if (!complaint) {
        throw new AppError('Complaint not found', 404);
      }

      complaint.comments.push({
        text: input.text,
        user: new Types.ObjectId(input.userId),
        createdAt: new Date()
      });

      await complaint.save();
      await complaint.populate('comments.user', 'name email role');
      await complaint.populate('raisedBy', 'name email flatNumber');

      logger.info(`Comment added to complaint: ${id} by ${input.userId}`);
      return complaint;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Add comment error:', error);
      throw new AppError('Failed to add comment', 500);
    }
  }

  static async deleteComplaint(id: string, userId: string, userRole: string): Promise<void> {
    try {
      const complaint = await Complaint.findById(id);
      if (!complaint) {
        throw new AppError('Complaint not found', 404);
      }

      if (complaint.raisedBy.toString() !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to delete this complaint', 403);
      }

      await complaint.deleteOne();
      logger.info(`Complaint deleted: ${id} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete complaint error:', error);
      throw new AppError('Failed to delete complaint', 500);
    }
  }
}

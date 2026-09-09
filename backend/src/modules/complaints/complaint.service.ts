import { Complaint, IComplaint, ComplaintStatus, ComplaintPriority } from '../../models/Complaint';
import { User } from '../../models/User';
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
  user: string;
}

export class ComplaintService {
  static async createComplaint(input: CreateComplaintInput): Promise<IComplaint> {
    try {
      const complaint = await Complaint.create({
        ...input,
        raisedBy: new Types.ObjectId(input.raisedBy)
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
    filters: any,
    page: number = 1,
    limit: number = 10,
    userId?: string,
    userRole?: string
  ): Promise<{ complaints: IComplaint[]; total: number }> {
    try {
      const query: any = {};

      // If user is not admin, show only their complaints
      if (userRole !== 'admin' && userId) {
        query.raisedBy = new Types.ObjectId(userId);
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.category) {
        query.category = { $regex: filters.category, $options: 'i' };
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
          .populate('raisedBy', 'name email flatNumber wing')
          .populate('assignedTo', 'name email role'),
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
        .populate('raisedBy', 'name email flatNumber wing phone')
        .populate('assignedTo', 'name email role')
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

      // If status is being changed to resolved
      if (input.status === ComplaintStatus.RESOLVED && complaint.status !== ComplaintStatus.RESOLVED) {
        input = { ...input, resolvedAt: new Date() };
      }

      Object.assign(complaint, input);
      await complaint.save();

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
        user: new Types.ObjectId(input.user),
        createdAt: new Date()
      });

      await complaint.save();
      await complaint.populate('comments.user', 'name email role');
      await complaint.populate('raisedBy', 'name email flatNumber');

      logger.info(`Comment added to complaint: ${id} by ${input.user}`);
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
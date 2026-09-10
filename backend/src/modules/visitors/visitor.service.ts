import { Visitor, IVisitor, VisitorStatus } from '../../models/Visitor';
import { User } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

interface CreateVisitorInput {
  name: string;
  phone: string;
  purpose: string;
  hostFlat: string;
  hostName?: string;
  vehicleNumber?: string;
  photo?: string;
  idProof?: string;
  notes?: string;
}

interface UpdateVisitorInput {
  name?: string;
  phone?: string;
  purpose?: string;
  hostFlat?: string;
  vehicleNumber?: string;
  status?: VisitorStatus;
  notes?: string;
}

export class VisitorService {
  static async createVisitor(
    input: CreateVisitorInput,
    userId: string
  ): Promise<IVisitor> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role === 'resident' && (!user.flatNumber || input.hostFlat !== user.flatNumber)) {
        throw new AppError('Residents can only pre-approve visitors for their own flat', 403);
      }

      const isResidentPreApproval = user.role === 'resident';
      const isGateCheckIn = user.role === 'security' || user.role === 'admin';

      const visitor = await Visitor.create({
        ...input,
        society: user.society,
        status: isResidentPreApproval ? VisitorStatus.PRE_APPROVED : VisitorStatus.CHECKED_IN,
        ...(isResidentPreApproval ? { preApprovedBy: user._id } : {}),
        ...(isGateCheckIn ? { entryTime: new Date() } : {})
      });

      await visitor.populate('preApprovedBy', 'name email');

      logger.info(`Visitor created: ${visitor.name} by ${userId}`);
      return visitor;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create visitor error:', error);
      throw new AppError('Failed to create visitor', 500);
    }
  }

  static async getVisitors(
    filters: any,
    page: number = 1,
    limit: number = 10,
    userId?: string,
    userRole?: string
  ): Promise<{ visitors: IVisitor[]; total: number }> {
    try {
      const query: any = {};

      // Security sees its society's pre-approvals; residents only see their own.
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          query.society = user.society;
          if (userRole === 'resident') {
            query.preApprovedBy = user._id;
          }
        }
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate) {
        query.createdAt = { $gte: filters.startDate };
      }

      if (filters.endDate) {
        query.createdAt = { ...query.createdAt, $lte: filters.endDate };
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { phone: { $regex: filters.search, $options: 'i' } },
          { hostFlat: { $regex: filters.search, $options: 'i' } },
          { purpose: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [visitors, total] = await Promise.all([
        Visitor.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('preApprovedBy', 'name email'),
        Visitor.countDocuments(query)
      ]);

      return { visitors, total };
    } catch (error) {
      logger.error('Get visitors error:', error);
      throw new AppError('Failed to get visitors', 500);
    }
  }

  static async getVisitorById(id: string): Promise<IVisitor> {
    try {
      const visitor = await Visitor.findById(id)
        .populate('preApprovedBy', 'name email');

      if (!visitor) {
        throw new AppError('Visitor not found', 404);
      }

      return visitor;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get visitor error:', error);
      throw new AppError('Failed to get visitor', 500);
    }
  }

  static async updateVisitor(
    id: string,
    input: UpdateVisitorInput,
    userId: string
  ): Promise<IVisitor> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const visitor = await Visitor.findById(id);
      if (!visitor) {
        throw new AppError('Visitor not found', 404);
      }

      // Check permissions
      if (visitor.preApprovedBy?.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to update this visitor', 403);
      }

      Object.assign(visitor, input);
      await visitor.save();

      await visitor.populate('preApprovedBy', 'name email');

      logger.info(`Visitor updated: ${id} by ${userId}`);
      return visitor;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update visitor error:', error);
      throw new AppError('Failed to update visitor', 500);
    }
  }

  static async checkInVisitor(
    id: string,
    userId: string,
    notes?: string
  ): Promise<IVisitor> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const visitor = await Visitor.findById(id);
      if (!visitor) {
        throw new AppError('Visitor not found', 404);
      }

      // Only security or admin can check in
      if (user.role !== 'security' && user.role !== 'admin') {
        throw new AppError('Only security or admin can check in visitors', 403);
      }

      if (visitor.status === VisitorStatus.CHECKED_IN) {
        throw new AppError('Visitor is already checked in', 400);
      }

      visitor.status = VisitorStatus.CHECKED_IN;
      visitor.entryTime = new Date();
      if (notes) visitor.notes = notes;
      await visitor.save();
      await visitor.populate('preApprovedBy', 'name email');

      logger.info(`Visitor checked in: ${id} by ${userId}`);
      return visitor;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Check in visitor error:', error);
      throw new AppError('Failed to check in visitor', 500);
    }
  }

  static async checkOutVisitor(
    id: string,
    userId: string,
    notes?: string
  ): Promise<IVisitor> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const visitor = await Visitor.findById(id);
      if (!visitor) {
        throw new AppError('Visitor not found', 404);
      }

      // Only security or admin can check out
      if (user.role !== 'security' && user.role !== 'admin') {
        throw new AppError('Only security or admin can check out visitors', 403);
      }

      if (visitor.status !== VisitorStatus.CHECKED_IN) {
        throw new AppError('Visitor is not checked in', 400);
      }

      visitor.status = VisitorStatus.CHECKED_OUT;
      visitor.exitTime = new Date();
      if (notes) visitor.notes = notes;

      await visitor.save();
      await visitor.populate('preApprovedBy', 'name email');

      logger.info(`Visitor checked out: ${id} by ${userId}`);
      return visitor;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Check out visitor error:', error);
      throw new AppError('Failed to check out visitor', 500);
    }
  }

  static async deleteVisitor(id: string, userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can delete visitor records', 403);
      }

      const visitor = await Visitor.findById(id);
      if (!visitor) {
        throw new AppError('Visitor not found', 404);
      }

      await visitor.deleteOne();
      logger.info(`Visitor deleted: ${id} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete visitor error:', error);
      throw new AppError('Failed to delete visitor', 500);
    }
  }

  static async getVisitorStats(societyId: string): Promise<any> {
    try {
      const stats = await Visitor.aggregate([
        { $match: { society: new Types.ObjectId(societyId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayVisitors = await Visitor.countDocuments({
        society: new Types.ObjectId(societyId),
        entryTime: { $gte: today }
      });

      const activeVisitors = await Visitor.countDocuments({
        society: new Types.ObjectId(societyId),
        status: VisitorStatus.CHECKED_IN
      });

      return {
        stats,
        todayVisitors,
        activeVisitors
      };
    } catch (error) {
      logger.error('Get visitor stats error:', error);
      throw new AppError('Failed to get visitor stats', 500);
    }
  }
}

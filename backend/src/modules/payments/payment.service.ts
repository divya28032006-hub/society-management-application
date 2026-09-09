import { Payment, IPayment, PaymentStatus, PaymentMethod } from '../../models/Payment';
import { User } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

interface CreatePaymentInput {
  userId: string;
  amount: number;
  month: number;
  year: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  remarks?: string;
  lateFee?: number;
  discount?: number;
  dueDate?: Date;
  isRecurring?: boolean;
  recurringMonths?: number[];
}

interface UpdatePaymentInput {
  amount?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  remarks?: string;
  lateFee?: number;
  discount?: number;
  paymentDate?: Date;
}

interface PaymentFilters {
  status?: PaymentStatus;
  month?: number;
  year?: number;
  userId?: string;
  search?: string;
}

export class PaymentService {
  static async createPayment(
    input: CreatePaymentInput,
    createdBy: string
  ): Promise<IPayment> {
    try {
      // Check if user exists
      const user = await User.findById(input.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if payment already exists for this month/year
      const existingPayment = await Payment.findOne({
        user: input.userId,
        month: input.month,
        year: input.year
      });

      if (existingPayment) {
        throw new AppError(
          `Payment already exists for ${input.month}/${input.year}`,
          400
        );
      }

      // Calculate late fee if due date is passed
      let lateFee = input.lateFee || 0;
      if (!input.dueDate) {
        const lastDayOfMonth = new Date(input.year, input.month, 0);
        if (new Date() > lastDayOfMonth) {
          lateFee = lateFee || 50; // Default late fee
        }
      } else if (new Date() > new Date(input.dueDate)) {
        lateFee = lateFee || 50;
      }

      const payment = await Payment.create({
        user: input.userId,
        amount: input.amount,
        month: input.month,
        year: input.year,
        paymentMethod: input.paymentMethod,
        transactionId: input.transactionId,
        remarks: input.remarks,
        lateFee,
        discount: input.discount || 0,
        dueDate: input.dueDate || new Date(input.year, input.month, 0),
        isRecurring: input.isRecurring || false,
        recurringMonths: input.recurringMonths || [],
        society: user.society,
        status: PaymentStatus.PENDING
      });

      await payment.populate('user', 'name email flatNumber');
      await payment.populate('paidBy', 'name email');

      logger.info(`Payment created for user ${input.userId} for ${input.month}/${input.year}`);
      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create payment error:', error);
      throw new AppError('Failed to create payment', 500);
    }
  }

  static async getPayments(
    filters: PaymentFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ payments: IPayment[]; total: number; stats: any }> {
    try {
      const query: any = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.month) {
        query.month = filters.month;
      }

      if (filters.year) {
        query.year = filters.year;
      }

      if (filters.userId) {
        query.user = new Types.ObjectId(filters.userId);
      }

      if (filters.search) {
        const users = await User.find({
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } },
            { flatNumber: { $regex: filters.search, $options: 'i' } }
          ]
        }).select('_id');

        const userIds = users.map(u => u._id);
        if (userIds.length > 0) {
          query.user = { $in: userIds };
        }
      }

      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        Payment.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email flatNumber wing')
          .populate('paidBy', 'name email'),
        Payment.countDocuments(query)
      ]);

      // Calculate statistics
      const stats = await Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalPaid: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
              }
            },
            totalPending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
              }
            },
            totalOverdue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0]
              }
            },
            count: { $sum: 1 },
            paidCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, 1, 0]
              }
            },
            pendingCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
              }
            },
            overdueCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0]
              }
            }
          }
        }
      ]);

      return {
        payments,
        total,
        stats: stats[0] || {
          totalAmount: 0,
          totalPaid: 0,
          totalPending: 0,
          totalOverdue: 0,
          count: 0,
          paidCount: 0,
          pendingCount: 0,
          overdueCount: 0
        }
      };
    } catch (error) {
      logger.error('Get payments error:', error);
      throw new AppError('Failed to get payments', 500);
    }
  }

  static async getPaymentById(id: string): Promise<IPayment> {
    try {
      const payment = await Payment.findById(id)
        .populate('user', 'name email flatNumber wing phone')
        .populate('paidBy', 'name email');

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get payment error:', error);
      throw new AppError('Failed to get payment', 500);
    }
  }

  static async updatePayment(
    id: string,
    input: UpdatePaymentInput,
    userId: string
  ): Promise<IPayment> {
    try {
      const payment = await Payment.findById(id);
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      // Check if user has permission (admin or the payment owner)
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (payment.user.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to update this payment', 403);
      }

      // If status is being changed to paid
      if (input.status === PaymentStatus.PAID && !payment.paymentDate) {
        input = {
          ...input,
          paymentDate: new Date()
        };
      }

      Object.assign(payment, input);
      await payment.save();

      await payment.populate('user', 'name email flatNumber');
      await payment.populate('paidBy', 'name email');

      logger.info(`Payment updated: ${id} by ${userId}`);
      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update payment error:', error);
      throw new AppError('Failed to update payment', 500);
    }
  }

  static async markAsPaid(
    id: string,
    userId: string,
    paymentMethod?: PaymentMethod,
    transactionId?: string,
    remarks?: string
  ): Promise<IPayment> {
    try {
      const payment = await Payment.findById(id);
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.status === PaymentStatus.PAID) {
        throw new AppError('Payment is already marked as paid', 400);
      }

      payment.status = PaymentStatus.PAID;
      payment.paymentDate = new Date();
      payment.paidBy = new Types.ObjectId(userId);
      if (paymentMethod) payment.paymentMethod = paymentMethod;
      if (transactionId) payment.transactionId = transactionId;
      if (remarks) payment.remarks = remarks;

      await payment.save();
      await payment.populate('user', 'name email flatNumber');
      await payment.populate('paidBy', 'name email');

      logger.info(`Payment marked as paid: ${id} by ${userId}`);
      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Mark payment as paid error:', error);
      throw new AppError('Failed to mark payment as paid', 500);
    }
  }

  static async deletePayment(id: string, userId: string): Promise<void> {
    try {
      const payment = await Payment.findById(id);
      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      // Check if user is admin
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can delete payments', 403);
      }

      await payment.deleteOne();
      logger.info(`Payment deleted: ${id} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete payment error:', error);
      throw new AppError('Failed to delete payment', 500);
    }
  }

  static async getUserPaymentHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ payments: IPayment[]; total: number; stats: any }> {
    try {
      const query = { user: new Types.ObjectId(userId) };
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        Payment.find(query)
          .sort({ year: -1, month: -1 })
          .skip(skip)
          .limit(limit)
          .populate('paidBy', 'name email'),
        Payment.countDocuments(query)
      ]);

      // Calculate user payment statistics
      const stats = await Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalPaid: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
              }
            },
            totalPending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
              }
            },
            totalOverdue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0]
              }
            },
            paidCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, 1, 0]
              }
            },
            pendingCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
              }
            },
            overdueCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0]
              }
            },
            lastPaymentDate: {
              $max: '$paymentDate'
            }
          }
        }
      ]);

      return {
        payments,
        total,
        stats: stats[0] || {
          totalPaid: 0,
          totalPending: 0,
          totalOverdue: 0,
          paidCount: 0,
          pendingCount: 0,
          overdueCount: 0,
          lastPaymentDate: null
        }
      };
    } catch (error) {
      logger.error('Get user payment history error:', error);
      throw new AppError('Failed to get payment history', 500);
    }
  }

  static async getPaymentSummary(societyId: string): Promise<any> {
    try {
      const summary = await Payment.aggregate([
        { $match: { society: new Types.ObjectId(societyId) } },
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get monthly summary
      const monthlySummary = await Payment.aggregate([
        { $match: { society: new Types.ObjectId(societyId) } },
        {
          $group: {
            _id: {
              year: '$year',
              month: '$month'
            },
            totalAmount: { $sum: '$amount' },
            paidAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
              }
            },
            pendingAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      return {
        statusSummary: summary,
        monthlySummary
      };
    } catch (error) {
      logger.error('Get payment summary error:', error);
      throw new AppError('Failed to get payment summary', 500);
    }
  }
}
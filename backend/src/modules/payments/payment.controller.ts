import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';
import { UserRole } from '../../models/User';

export class PaymentController {
  static createPayment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const payment = await PaymentService.createPayment(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: { payment }
    });
  });

  static getPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as any;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const userId = req.query.userId as string;
    const search = req.query.search as string;

    const { payments, total, stats } = await PaymentService.getPayments(
      { status, month, year, userId, search },
      page,
      limit
    );

    res.status(200).json({
      status: 'success',
      data: { payments },
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getPaymentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payment = await PaymentService.getPaymentById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { payment }
    });
  });

  static updatePayment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const payment = await PaymentService.updatePayment(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { payment }
    });
  });

  static markAsPaid = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const { paymentMethod, transactionId, remarks } = req.body;
    const payment = await PaymentService.markAsPaid(
      req.params.id,
      req.user.id,
      paymentMethod,
      transactionId,
      remarks
    );

    res.status(200).json({
      status: 'success',
      data: { payment }
    });
  });

  static deletePayment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await PaymentService.deletePayment(req.params.id, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  static getUserPaymentHistory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Check if user is requesting their own history or is admin
    if (userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new AppError('You do not have permission to view this user\'s payment history', 403);
    }

    const { payments, total, stats } = await PaymentService.getUserPaymentHistory(
      userId,
      page,
      limit
    );

    res.status(200).json({
      status: 'success',
      data: { payments },
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getPaymentSummary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    // Only admins can view payment summary
    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError('Only admins can view payment summary', 403);
    }

    const summary = await PaymentService.getPaymentSummary(req.user.society.toString());

    res.status(200).json({
      status: 'success',
      data: summary
    });
  });
}
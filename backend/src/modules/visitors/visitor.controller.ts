import { Request, Response, NextFunction } from 'express';
import { VisitorService } from './visitor.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';

export class VisitorController {
  static create = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const visitor = await VisitorService.createVisitor(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: { visitor }
    });
  });

  static getAll = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { status, startDate, endDate, search } = req.query;

    const { visitors, total } = await VisitorService.getVisitors(
      { status, startDate, endDate, search },
      page,
      limit,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      data: { visitors },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const visitor = await VisitorService.getVisitorById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { visitor }
    });
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const visitor = await VisitorService.updateVisitor(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { visitor }
    });
  });

  static checkIn = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const visitor = await VisitorService.checkInVisitor(
      req.params.id,
      req.user.id,
      req.body.notes
    );

    res.status(200).json({
      status: 'success',
      data: { visitor }
    });
  });

  static checkOut = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const visitor = await VisitorService.checkOutVisitor(
      req.params.id,
      req.user.id,
      req.body.notes
    );

    res.status(200).json({
      status: 'success',
      data: { visitor }
    });
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await VisitorService.deleteVisitor(req.params.id, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  static getStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const stats = await VisitorService.getVisitorStats(req.user.society.toString());

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });
}
import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from './complaint.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';

export class ComplaintController {
  static create = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const complaint = await ComplaintService.createComplaint({
      ...req.body,
      raisedBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: { complaint }
    });
  });

  static getAll = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { status, priority, category, search } = req.query;

    const { complaints, total } = await ComplaintService.getComplaints(
      { status, priority, category, search },
      page,
      limit,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      data: { complaints },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const complaint = await ComplaintService.getComplaintById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { complaint }
    });
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const complaint = await ComplaintService.updateComplaint(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      data: { complaint }
    });
  });

  static addComment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const complaint = await ComplaintService.addComment(req.params.id, {
      text: req.body.text,
      user: req.user.id
    });

    res.status(200).json({
      status: 'success',
      data: { complaint }
    });
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await ComplaintService.deleteComplaint(req.params.id, req.user.id, req.user.role);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}
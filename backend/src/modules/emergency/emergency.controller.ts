import { Request, Response, NextFunction } from 'express';
import { EmergencyService } from './emergency.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';

export class EmergencyController {
  static create = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const contact = await EmergencyService.createContact(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: { contact }
    });
  });

  static getAll = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { designation, search } = req.query;

    const { contacts, total } = await EmergencyService.getContacts(
      { designation, search },
      page,
      limit,
      req.user.society.toString()
    );

    res.status(200).json({
      status: 'success',
      data: { contacts },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const contact = await EmergencyService.getContactById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { contact }
    });
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const contact = await EmergencyService.updateContact(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { contact }
    });
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await EmergencyService.deleteContact(req.params.id, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}
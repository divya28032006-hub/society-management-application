import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from './announcement.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';
import { AnnouncementCategory } from '../../models/Announcement';

export class AnnouncementController {
  static create = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const announcement = await AnnouncementService.createAnnouncement({
      ...req.body,
      author: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: { announcement }
    });
  });

  static getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as AnnouncementCategory;
    const search = req.query.search as string;

    const { announcements, total } = await AnnouncementService.getAllAnnouncements(
      page,
      limit,
      category,
      search
    );

    res.status(200).json({
      status: 'success',
      data: { announcements },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await AnnouncementService.getAnnouncementById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const announcement = await AnnouncementService.updateAnnouncement(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await AnnouncementService.deleteAnnouncement(req.params.id, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  static markAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const announcement = await AnnouncementService.markAsRead(req.params.id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: { announcement }
    });
  });
}
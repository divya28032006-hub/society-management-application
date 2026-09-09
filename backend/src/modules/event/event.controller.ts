import { Request, Response, NextFunction } from 'express';
import { EventService } from './event.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';

export class EventController {
  static create = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const event = await EventService.createEvent(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: { event }
    });
  });

  static getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { startDate, endDate, search } = req.query;

    const { events, total } = await EventService.getEvents(
      page,
      limit,
      { startDate, endDate, search }
    );

    res.status(200).json({
      status: 'success',
      data: { events },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const event = await EventService.getEventById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { event }
    });
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const event = await EventService.updateEvent(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { event }
    });
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await EventService.deleteEvent(req.params.id, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  static rsvp = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const { status } = req.body;
    const event = await EventService.rsvpToEvent(
      req.params.id,
      req.user.id,
      status
    );

    res.status(200).json({
      status: 'success',
      data: { event }
    });
  });

  static getAttendees = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { attendees, stats } = await EventService.getEventAttendees(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { attendees, stats }
    });
  });
}
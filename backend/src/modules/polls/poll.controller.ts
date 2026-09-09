import { Request, Response, NextFunction } from 'express';
import { PollService } from './poll.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';

export class PollController {
  static create = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const poll = await PollService.createPoll(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: { poll }
    });
  });

  static getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isActive = req.query.isActive === 'true' ? true : 
                     req.query.isActive === 'false' ? false : undefined;
    const search = req.query.search as string;

    const { polls, total } = await PollService.getPolls(
      page,
      limit,
      isActive,
      search
    );

    res.status(200).json({
      status: 'success',
      data: { polls },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static getById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const poll = await PollService.getPollById(req.params.id, req.user?.id);

    res.status(200).json({
      status: 'success',
      data: { poll }
    });
  });

  static vote = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const poll = await PollService.voteOnPoll(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      status: 'success',
      data: { poll }
    });
  });

  static getResults = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const results = await PollService.getPollResults(req.params.id);

    res.status(200).json({
      status: 'success',
      data: results
    });
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const poll = await PollService.updatePoll(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { poll }
    });
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await PollService.deletePoll(req.params.id, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}
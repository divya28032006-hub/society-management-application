import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user, token } = await AuthService.register(req.body);
    res.status(201).json({
      status: 'success',
      data: { user, token }
    });
  });

  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user, token } = await AuthService.login(req.body);
    res.status(200).json({
      status: 'success',
      data: { user, token }
    });
  });

  static getCurrentUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }
    res.status(200).json({
      status: 'success',
      data: { user: req.user }
    });
  });

  static logout = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Client-side token removal - server doesn't need to do anything for JWT
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
}
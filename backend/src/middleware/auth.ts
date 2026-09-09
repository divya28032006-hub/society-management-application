import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to access this resource.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as {
      id: string;
      email: string;
      role: UserRole;
    };

    // Get user from token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact administration.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Your token has expired. Please log in again.', 401));
    } else {
      next(error);
    }
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not found', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const restrictToAdminOrSecurity = restrictTo(UserRole.ADMIN, UserRole.SECURITY);
export const restrictToAdmin = restrictTo(UserRole.ADMIN);
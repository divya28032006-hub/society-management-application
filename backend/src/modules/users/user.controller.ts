import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';
import { UserRole } from '../../models/User';
import { sendSuccess, sendPaginatedSuccess, sendCreated } from '../../utils/apiResponse';

export class UserController {
  /**
   * Get current user profile
   */
  static getProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const user = await UserService.getProfile(req.user.id);
    sendSuccess(res, { user }, 'Profile retrieved successfully');
  });

  /**
   * Update current user profile
   */
  static updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const user = await UserService.updateProfile(req.user.id, req.body);
    sendSuccess(res, { user }, 'Profile updated successfully');
  });

  /**
   * Change user password
   */
  static changePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const { currentPassword, newPassword } = req.body;
    await UserService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, null, 'Password changed successfully');
  });

  /**
   * Get member directory
   */
  static getMemberDirectory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as UserRole;
    const isActive = req.query.isActive === 'true' ? true : 
                     req.query.isActive === 'false' ? false : undefined;

    const { users, total } = await UserService.getMemberDirectory(
      page,
      limit,
      search,
      role,
      isActive
    );

    sendPaginatedSuccess(
      res,
      { users },
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      'Member directory retrieved successfully'
    );
  });

  /**
   * Get user by ID (admin only)
   */
  static getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.getUserById(req.params.id);
    sendSuccess(res, { user }, 'User retrieved successfully');
  });

  /**
   * Update user by admin
   */
  static updateUserByAdmin = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    // Only admins can update other users
    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError('Only admins can update other users', 403);
    }

    const user = await UserService.updateUserByAdmin(req.params.id, req.body);
    sendSuccess(res, { user }, 'User updated successfully');
  });

  /**
   * Delete user (soft delete) by admin
   */
  static deleteUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError('Only admins can delete users', 403);
    }

    await UserService.deleteUser(req.params.id);
    sendSuccess(res, null, 'User deactivated successfully', 204);
  });

  /**
   * Hard delete user by admin
   */
  static hardDeleteUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError('Only admins can permanently delete users', 403);
    }

    await UserService.hardDeleteUser(req.params.id);
    sendSuccess(res, null, 'User permanently deleted successfully', 204);
  });

  /**
   * Get user statistics (admin only)
   */
  static getUserStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError('Only admins can view user statistics', 403);
    }

    const stats = await UserService.getUserStats(req.user.society.toString());
    sendSuccess(res, stats, 'User statistics retrieved successfully');
  });

  /**
   * Get society members
   */
  static getSocietyMembers = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const { users, total } = await UserService.getSocietyMembers(
      req.user.society.toString(),
      page,
      limit,
      search
    );

    sendPaginatedSuccess(
      res,
      { users },
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      'Society members retrieved successfully'
    );
  });

  /**
   * Update profile picture
   */
  static updateProfilePicture = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const { profilePicture } = req.body;
    if (!profilePicture) {
      throw new AppError('Profile picture URL is required', 400);
    }

    const user = await UserService.updateProfilePicture(req.user.id, profilePicture);
    sendSuccess(res, { user }, 'Profile picture updated successfully');
  });
}
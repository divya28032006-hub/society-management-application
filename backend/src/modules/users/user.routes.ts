import express from 'express';
import { UserController } from './user.controller';
import { protect, restrictToAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  updateProfileValidation,
  changePasswordValidation,
  updateUserByAdminValidation,
  getUsersValidation
} from './user.validators';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Current user routes
router.get('/profile', UserController.getProfile);
router.patch('/profile', validate(updateProfileValidation), UserController.updateProfile);
router.patch('/change-password', validate(changePasswordValidation), UserController.changePassword);
router.patch('/profile-picture', UserController.updateProfilePicture);

// Member directory (accessible to all authenticated users)
router.get('/directory', validate(getUsersValidation), UserController.getMemberDirectory);

// Society members
router.get('/society-members', UserController.getSocietyMembers);

// Admin only routes
router.get('/stats', restrictToAdmin, UserController.getUserStats);

// Admin user management
router
  .route('/admin/users/:id')
  .get(restrictToAdmin, UserController.getUserById)
  .patch(restrictToAdmin, validate(updateUserByAdminValidation), UserController.updateUserByAdmin)
  .delete(restrictToAdmin, UserController.deleteUser);

// Hard delete (admin only)
router.delete(
  '/admin/users/:id/permanent',
  restrictToAdmin,
  UserController.hardDeleteUser
);

export default router;
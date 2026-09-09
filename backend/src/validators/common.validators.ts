import { body, param, query } from 'express-validator';

// Common parameter validators
export const mongoIdParam = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

export const pageQuery = query('page')
  .optional()
  .isInt({ min: 1 })
  .withMessage('Page must be a positive integer')
  .toInt();

export const limitQuery = query('limit')
  .optional()
  .isInt({ min: 1, max: 100 })
  .withMessage('Limit must be between 1 and 100')
  .toInt();

export const searchQuery = query('search')
  .optional()
  .trim()
  .isLength({ max: 100 })
  .withMessage('Search term cannot exceed 100 characters');

// User validators
export const userEmailBody = body('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail();

export const userPhoneBody = body('phone')
  .notEmpty()
  .withMessage('Phone number is required')
  .matches(/^[0-9]{10}$/)
  .withMessage('Please provide a valid 10-digit phone number');

export const userNameBody = body('name')
  .notEmpty()
  .withMessage('Name is required')
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .trim();

export const userPasswordBody = body('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const userRoleBody = body('role')
  .optional()
  .isIn(['resident', 'admin', 'security'])
  .withMessage('Invalid role');

// Pagination validators
export const paginationValidators = [pageQuery, limitQuery];

// Search validators
export const searchValidators = [searchQuery];
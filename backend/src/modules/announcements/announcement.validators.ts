import { body, param, query } from 'express-validator';

export const createAnnouncementValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .trim(),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters')
    .trim(),
  body('category')
    .optional()
    .isIn(['general', 'maintenance', 'emergency', 'event', 'admin'])
    .withMessage('Invalid category'),
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('Pinned must be a boolean'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate()
];

export const updateAnnouncementValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid announcement ID'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .trim(),
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters')
    .trim(),
  body('category')
    .optional()
    .isIn(['general', 'maintenance', 'emergency', 'event', 'admin'])
    .withMessage('Invalid category'),
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('Pinned must be a boolean'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate()
];

export const getAnnouncementsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('category')
    .optional()
    .isIn(['general', 'maintenance', 'emergency', 'event', 'admin'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];
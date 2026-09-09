import { body, param, query } from 'express-validator';

export const createNotificationValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Invalid notification type. Must be one of: info, warning, success, error'),
  body('link')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

export const createBulkNotificationValidation = [
  body('userIds')
    .notEmpty()
    .withMessage('User IDs array is required')
    .isArray({ min: 1 })
    .withMessage('User IDs must be an array with at least one ID')
    .custom((userIds) => {
      for (const id of userIds) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error(`Invalid user ID: ${id}`);
        }
      }
      return true;
    }),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Invalid notification type. Must be one of: info, warning, success, error'),
  body('link')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

export const getNotificationsValidation = [
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
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
  query('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Invalid notification type'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate()
];

export const markAsReadValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid notification ID')
];

export const markAllAsReadValidation = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID')
];

export const deleteNotificationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid notification ID')
];

export const getNotificationByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid notification ID')
];
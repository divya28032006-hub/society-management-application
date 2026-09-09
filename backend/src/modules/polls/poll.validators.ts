import { body, param, query } from 'express-validator';

export const createPollValidation = [
  body('question')
    .notEmpty()
    .withMessage('Poll question is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Question must be between 5 and 200 characters'),
  body('options')
    .isArray({ min: 2 })
    .withMessage('At least 2 options are required')
    .custom((options) => {
      if (options.some((opt: any) => !opt.text || opt.text.trim().length === 0)) {
        throw new Error('Each option must have text');
      }
      return true;
    }),
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate()
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  body('isMultipleChoice')
    .optional()
    .isBoolean()
    .withMessage('isMultipleChoice must be a boolean')
];

export const updatePollValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid poll ID'),
  body('question')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Question must be between 5 and 200 characters'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate()
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const voteValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid poll ID'),
  body('optionIndex')
    .notEmpty()
    .withMessage('Option index is required')
    .isInt({ min: 0 })
    .withMessage('Invalid option index')
];

export const getPollsValidation = [
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
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];
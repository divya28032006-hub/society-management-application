import { body, param, query } from 'express-validator';

export const createVisitorValidation = [
  body('name')
    .notEmpty()
    .withMessage('Visitor name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('purpose')
    .notEmpty()
    .withMessage('Purpose is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Purpose must be between 3 and 100 characters'),
  body('hostFlat')
    .notEmpty()
    .withMessage('Host flat number is required')
    .trim(),
  body('hostName')
    .optional()
    .trim(),
  body('vehicleNumber')
    .optional()
    .trim(),
  body('photo')
    .optional()
    .isURL()
    .withMessage('Please provide a valid photo URL'),
  body('idProof')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
];

export const updateVisitorValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid visitor ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('purpose')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Purpose must be between 3 and 100 characters'),
  body('hostFlat')
    .optional()
    .trim(),
  body('vehicleNumber')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'pre_approved', 'approved', 'checked_in', 'checked_out', 'rejected'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
];

export const checkInValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid visitor ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
];

export const checkOutValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid visitor ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
];

export const getVisitorsValidation = [
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
  query('status')
    .optional()
    .isIn(['pending', 'pre_approved', 'approved', 'checked_in', 'checked_out', 'rejected'])
    .withMessage('Invalid status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];

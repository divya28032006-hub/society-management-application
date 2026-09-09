import { body, param, query } from 'express-validator';

export const createEventValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim(),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
    .toDate(),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean'),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL')
];

export const updateEventValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('location')
    .optional()
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
    .toDate(),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean'),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL')
];

export const rsvpValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('status')
    .notEmpty()
    .withMessage('RSVP status is required')
    .isIn(['going', 'maybe', 'not_going'])
    .withMessage('Invalid RSVP status')
];

export const getEventsValidation = [
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
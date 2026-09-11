import { body, param, query } from 'express-validator';

export const createFacilityValidation = [
  body('name')
    .notEmpty()
    .withMessage('Facility name is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('availableSlots')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available slots cannot be negative'),
  body('rules')
    .optional()
    .isArray()
    .withMessage('Rules must be an array'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('bookingFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Booking fee must be a positive number'),
  body('operatingHours')
    .optional()
    .isObject()
    .withMessage('Operating hours must be an object'),
  body('operatingHours.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('operatingHours.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)')
    .custom((value, { req }) => {
      if (req.body.operatingHours?.start && value <= req.body.operatingHours.start) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array')
];

export const updateFacilityValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid facility ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('availableSlots')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available slots cannot be negative'),
  body('rules')
    .optional()
    .isArray()
    .withMessage('Rules must be an array'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('bookingFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Booking fee must be a positive number'),
  body('operatingHours')
    .optional()
    .isObject()
    .withMessage('Operating hours must be an object'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array')
];

export const createBookingValidation = [
  body('facilityId')
    .notEmpty()
    .withMessage('Facility ID is required')
    .isMongoId()
    .withMessage('Invalid facility ID'),
  body('date')
    .notEmpty()
    .withMessage('Booking date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate()
    .custom((value) => {
      // Compare calendar dates only so today is a valid booking date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(value);
      bookingDate.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)')
    .custom((value, { req }) => {
      if (req.body.startTime && value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('attendees')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Attendees must be between 1 and 10'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Special requests cannot exceed 200 characters')
];

export const updateBookingValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('status')
    .optional()
    .isIn(['booked', 'cancelled', 'completed', 'pending'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Special requests cannot exceed 200 characters')
];

export const getFacilitiesValidation = [
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
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('hasAvailability')
    .optional()
    .isBoolean()
    .withMessage('hasAvailability must be a boolean')
];

export const getBookingsValidation = [
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
    .isIn(['booked', 'cancelled', 'completed', 'pending'])
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
  query('facilityId')
    .optional()
    .isMongoId()
    .withMessage('Invalid facility ID')
];
import { CustomValidator } from 'express-validator';

// Check if value is a valid MongoDB ObjectId
export const isMongoId: CustomValidator = (value) => {
  if (!/^[0-9a-fA-F]{24}$/.test(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

// Check if value is in array
export const isInArray = (allowedValues: any[]) => {
  return (value: any) => {
    if (!allowedValues.includes(value)) {
      throw new Error(`Value must be one of: ${allowedValues.join(', ')}`);
    }
    return true;
  };
};

// Check if date is not in the past
export const isFutureDate: CustomValidator = (value) => {
  if (new Date(value) < new Date()) {
    throw new Error('Date must be in the future');
  }
  return true;
};

// Check if date is not in the future
export const isPastDate: CustomValidator = (value) => {
  if (new Date(value) > new Date()) {
    throw new Error('Date must be in the past');
  }
  return true;
};

// Check if time range is valid
export const isValidTimeRange: CustomValidator = (value, { req }) => {
  const { startTime, endTime } = req.body;
  if (startTime && endTime && startTime >= endTime) {
    throw new Error('End time must be after start time');
  }
  return true;
};

// Check if amount is positive
export const isPositiveAmount: CustomValidator = (value) => {
  if (value <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  return true;
};

// Check if phone number is valid
export const isValidPhone: CustomValidator = (value) => {
  if (!/^[0-9]{10}$/.test(value)) {
    throw new Error('Please provide a valid 10-digit phone number');
  }
  return true;
};

// Check if email is valid
export const isValidEmail: CustomValidator = (value) => {
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
    throw new Error('Please provide a valid email address');
  }
  return true;
};
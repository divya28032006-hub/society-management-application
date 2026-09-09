import { ValidationError } from 'express-validator';

export const formatValidationErrors = (errors: ValidationError[]): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach((error) => {
    if (error.type === 'field') {
      formattedErrors[error.path] = error.msg;
    }
  });
  
  return formattedErrors;
};

// Common validation helpers
export const isValidMongoId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const isValidDate = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

export const isValidTime = (time: string): boolean => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const isValidPhone = (phone: string): boolean => {
  return /^[0-9]{10}$/.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && 
         /[a-z]/.test(password) && 
         /[A-Z]/.test(password) && 
         /\d/.test(password);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
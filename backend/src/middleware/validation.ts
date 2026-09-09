import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from '../utils/AppError';
import { formatValidationErrors } from '../utils/validation';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors and send response
    const formattedErrors = formatValidationErrors(errors.array());
    next(new AppError(JSON.stringify(formattedErrors), 400));
  };
};

// Optional: Validate specific parts of request
export const validateBody = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const formattedErrors = formatValidationErrors(errors.array());
    next(new AppError(JSON.stringify(formattedErrors), 400));
  };
};

export const validateQuery = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const formattedErrors = formatValidationErrors(errors.array());
    next(new AppError(JSON.stringify(formattedErrors), 400));
  };
};

export const validateParams = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const formattedErrors = formatValidationErrors(errors.array());
    next(new AppError(JSON.stringify(formattedErrors), 400));
  };
};
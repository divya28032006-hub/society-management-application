import express from 'express';
import { VisitorController } from './visitor.controller';
import { protect, restrictToAdmin, restrictToAdminOrSecurity } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createVisitorValidation,
  updateVisitorValidation,
  checkInValidation,
  checkOutValidation,
  getVisitorsValidation
} from './visitor.validators';

const router = express.Router();

router.use(protect);

// Get visitor stats
router.get(
  '/stats',
  restrictToAdminOrSecurity,
  VisitorController.getStats
);

// CRUD operations
router
  .route('/')
  .get(validate(getVisitorsValidation), VisitorController.getAll)
  .post(validate(createVisitorValidation), VisitorController.create);

router
  .route('/:id')
  .get(VisitorController.getById)
  .patch(validate(updateVisitorValidation), VisitorController.update)
  .delete(restrictToAdmin, VisitorController.delete);

// Check-in and Check-out
router.post(
  '/:id/check-in',
  restrictToAdminOrSecurity,
  validate(checkInValidation),
  VisitorController.checkIn
);

router.post(
  '/:id/check-out',
  restrictToAdminOrSecurity,
  validate(checkOutValidation),
  VisitorController.checkOut
);

export default router;
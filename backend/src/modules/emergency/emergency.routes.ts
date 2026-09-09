import express from 'express';
import { EmergencyController } from './emergency.controller';
import { protect, restrictToAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createEmergencyContactValidation,
  updateEmergencyContactValidation,
  getEmergencyContactsValidation
} from './emergency.validators';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(validate(getEmergencyContactsValidation), EmergencyController.getAll)
  .post(restrictToAdmin, validate(createEmergencyContactValidation), EmergencyController.create);

router
  .route('/:id')
  .get(EmergencyController.getById)
  .patch(restrictToAdmin, validate(updateEmergencyContactValidation), EmergencyController.update)
  .delete(restrictToAdmin, EmergencyController.delete);

export default router;
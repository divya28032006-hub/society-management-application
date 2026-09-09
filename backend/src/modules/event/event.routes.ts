import express from 'express';
import { EventController } from './event.controller';
import { protect } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createEventValidation,
  updateEventValidation,
  rsvpValidation,
  getEventsValidation
} from './event.validators';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(validate(getEventsValidation), EventController.getAll)
  .post(validate(createEventValidation), EventController.create);

router
  .route('/:id')
  .get(EventController.getById)
  .patch(validate(updateEventValidation), EventController.update)
  .delete(EventController.delete);

router.post(
  '/:id/rsvp',
  validate(rsvpValidation),
  EventController.rsvp
);

router.get(
  '/:id/attendees',
  EventController.getAttendees
);

export default router;
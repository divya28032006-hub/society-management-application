import express from 'express';
import { PollController } from './poll.controller';
import { protect, restrictToAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createPollValidation,
  updatePollValidation,
  voteValidation,
  getPollsValidation
} from './poll.validators';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all polls and create new poll
router
  .route('/')
  .get(validate(getPollsValidation), PollController.getAll)
  .post(restrictToAdmin, validate(createPollValidation), PollController.create);

// Get, update, delete specific poll
router
  .route('/:id')
  .get(PollController.getById)
  .patch(restrictToAdmin, validate(updatePollValidation), PollController.update)
  .delete(restrictToAdmin, PollController.delete);

// Vote on a poll
router.post(
  '/:id/vote',
  validate(voteValidation),
  PollController.vote
);

// Get poll results
router.get(
  '/:id/results',
  PollController.getResults
);

export default router;
import express from 'express';
import { ComplaintController } from './complaint.controller';
import { protect } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createComplaintValidation,
  updateComplaintValidation,
  addCommentValidation,
  getComplaintsValidation
} from './complaint.validators';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(validate(getComplaintsValidation), ComplaintController.getAll)
  .post(validate(createComplaintValidation), ComplaintController.create);

router
  .route('/:id')
  .get(ComplaintController.getById)
  .patch(validate(updateComplaintValidation), ComplaintController.update)
  .delete(ComplaintController.delete);

router.post(
  '/:id/comments',
  validate(addCommentValidation),
  ComplaintController.addComment
);

export default router;
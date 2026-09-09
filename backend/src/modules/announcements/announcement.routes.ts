import express from 'express';
import { AnnouncementController } from './announcement.controller';
import { protect, restrictToAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { createAnnouncementValidation, updateAnnouncementValidation } from './announcement.validators';

const router = express.Router();

router.use(protect);

router.get('/', AnnouncementController.getAll);
router.get('/:id', AnnouncementController.getById);

router.post(
  '/',
  restrictToAdmin,
  validate(createAnnouncementValidation),
  AnnouncementController.create
);

router.patch(
  '/:id',
  validate(updateAnnouncementValidation),
  AnnouncementController.update
);

router.delete('/:id', AnnouncementController.delete);
router.post('/:id/read', AnnouncementController.markAsRead);

export default router;
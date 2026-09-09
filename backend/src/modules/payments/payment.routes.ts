import express from 'express';
import { PaymentController } from './payment.controller';
import { protect, restrictToAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createPaymentValidation,
  updatePaymentValidation,
  markPaymentPaidValidation,
  getPaymentsValidation
} from './payment.validators';
import { UserRole } from '../../models/User';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get payment summary (admin only)
router.get(
  '/summary',
  restrictToAdmin,
  PaymentController.getPaymentSummary
);

// Get user payment history (admin or self)
router.get(
  '/user/:userId',
  PaymentController.getUserPaymentHistory
);

// Get current user's payment history
router.get(
  '/my-history',
  PaymentController.getUserPaymentHistory
);

// Payment CRUD operations
router
  .route('/')
  .get(
    validate(getPaymentsValidation),
    PaymentController.getPayments
  )
  .post(
    restrictToAdmin,
    validate(createPaymentValidation),
    PaymentController.createPayment
  );

router
  .route('/:id')
  .get(PaymentController.getPaymentById)
  .patch(
    validate(updatePaymentValidation),
    PaymentController.updatePayment
  )
  .delete(
    restrictToAdmin,
    PaymentController.deletePayment
  );

// Mark payment as paid
router.patch(
  '/:id/mark-paid',
  validate(markPaymentPaidValidation),
  PaymentController.markAsPaid
);

export default router;
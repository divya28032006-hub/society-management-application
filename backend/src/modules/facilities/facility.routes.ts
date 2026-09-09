import express from 'express';
import { FacilityController } from './facility.controller';
import { protect, restrictToAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  createFacilityValidation,
  updateFacilityValidation,
  createBookingValidation,
  updateBookingValidation,
  getFacilitiesValidation,
  getBookingsValidation
} from './facility.validators';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============ FACILITY ROUTES ============

// Get facility statistics (admin only)
router.get(
  '/stats',
  restrictToAdmin,
  FacilityController.getStats
);

// Get available slots for a facility
router.get(
  '/facilities/:facilityId/available-slots',
  FacilityController.getAvailableSlots
);

// Facility CRUD operations
router
  .route('/facilities')
  .get(validate(getFacilitiesValidation), FacilityController.getFacilities)
  .post(restrictToAdmin, validate(createFacilityValidation), FacilityController.createFacility);

router
  .route('/facilities/:id')
  .get(FacilityController.getFacilityById)
  .patch(restrictToAdmin, validate(updateFacilityValidation), FacilityController.updateFacility)
  .delete(restrictToAdmin, FacilityController.deleteFacility);

// ============ BOOKING ROUTES ============

// Booking CRUD operations
router
  .route('/bookings')
  .get(validate(getBookingsValidation), FacilityController.getBookings)
  .post(validate(createBookingValidation), FacilityController.createBooking);

router
  .route('/bookings/:id')
  .get(FacilityController.getBookingById)
  .delete(FacilityController.deleteBooking);

// Cancel booking
router.patch(
  '/bookings/:id/cancel',
  validate(updateBookingValidation),
  FacilityController.cancelBooking
);

export default router;
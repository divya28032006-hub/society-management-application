import { Request, Response, NextFunction } from 'express';
import { FacilityService } from './facility.service';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth';
import { BookingStatus } from '../../models/Booking';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/apiResponse';

export class FacilityController {
  // ============ FACILITY CONTROLLERS ============

  static createFacility = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const facility = await FacilityService.createFacility(req.body, req.user.id);
    sendSuccess(res, { facility }, 'Facility created successfully', 201);
  });

  static getFacilities = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isActive = req.query.isActive === 'true' ? true : 
                     req.query.isActive === 'false' ? false : undefined;
    const hasAvailability = req.query.hasAvailability === 'true' ? true : 
                            req.query.hasAvailability === 'false' ? false : undefined;

    const { facilities, total } = await FacilityService.getFacilities(
      page,
      limit,
      search,
      isActive,
      hasAvailability,
      req.user.society.toString()
    );

    sendPaginatedSuccess(
      res,
      { facilities },
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    );
  });

  static getFacilityById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const facility = await FacilityService.getFacilityById(req.params.id);
    sendSuccess(res, { facility });
  });

  static updateFacility = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const facility = await FacilityService.updateFacility(req.params.id, req.body, req.user.id);
    sendSuccess(res, { facility }, 'Facility updated successfully');
  });

  static deleteFacility = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await FacilityService.deleteFacility(req.params.id, req.user.id);
    sendSuccess(res, null, 'Facility deleted successfully');
  });

  static getStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const stats = await FacilityService.getFacilityStats(req.user.society.toString());
    sendSuccess(res, { stats });
  });

  static getAvailableSlots = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const result = await FacilityService.getAvailableSlots(req.params.facilityId, date);
    sendSuccess(res, result);
  });

  // ============ BOOKING CONTROLLERS ============

  static createBooking = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const bookingInput = {
      facilityId: req.body.facilityId,
      date: new Date(req.body.date),
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      attendees: req.body.attendees,
      notes: req.body.notes || req.body.purpose,
      specialRequests: req.body.specialRequests
    };

    const booking = await FacilityService.createBooking(bookingInput, req.user.id);
    sendSuccess(res, { booking }, 'Booking created successfully', 201);
  });

  static getBookings = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      status: req.query.status,
      facilityId: req.query.facilityId,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
    };

    const { bookings, total } = await FacilityService.getBookings(
      req.user.id,
      req.user.role,
      page,
      limit,
      filters
    );

    sendPaginatedSuccess(
      res,
      { bookings },
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    );
  });

  static getBookingById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const booking = await FacilityService.getBookingById(req.params.id);
    sendSuccess(res, { booking });
  });

  static cancelBooking = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const booking = await FacilityService.cancelBooking(req.params.id, req.user.id);
    sendSuccess(res, { booking }, 'Booking cancelled successfully');
  });

  static deleteBooking = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    await FacilityService.deleteBooking(req.params.id, req.user.id);
    sendSuccess(res, null, 'Booking deleted successfully');
  });
}

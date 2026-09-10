import { Facility, IFacility } from '../../models/Facility';
import { Booking, IBooking, BookingStatus } from '../../models/Booking';
import { User } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger, { logInfo, logError } from '../../utils/logger';
import { Types } from 'mongoose';

interface CreateFacilityInput {
  name: string;
  description: string;
  capacity: number;
  availableSlots?: number;
  rules?: string[];
  images?: string[];
  bookingFee?: number;
  operatingHours?: {
    start: string;
    end: string;
  };
  amenities?: string[];
}

interface UpdateFacilityInput {
  name?: string;
  description?: string;
  capacity?: number;
  availableSlots?: number;
  rules?: string[];
  images?: string[];
  isActive?: boolean;
  bookingFee?: number;
  operatingHours?: {
    start: string;
    end: string;
  };
  amenities?: string[];
}

interface CreateBookingInput {
  facilityId: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees?: number;
  notes?: string;
  specialRequests?: string;
}

export class FacilityService {
  // ============ FACILITY CRUD ============

  static async createFacility(
    input: CreateFacilityInput,
    userId: string
  ): Promise<IFacility> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can create facilities', 403);
      }

      // Check if facility with same name exists
      const existingFacility = await Facility.findOne({ 
        name: input.name,
        society: user.society
      });
      if (existingFacility) {
        throw new AppError('Facility with this name already exists', 400);
      }

      const facility = await Facility.create({
        ...input,
        availableSlots: input.availableSlots || input.capacity,
        society: user.society
      });

      logInfo('FacilityService', `Facility created: ${facility.name}`, { userId });
      return facility;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { input, userId });
      throw new AppError('Failed to create facility', 500);
    }
  }

  static async getFacilities(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
    hasAvailability?: boolean,
    societyId?: string
  ): Promise<{ facilities: IFacility[]; total: number }> {
    try {
      const query: any = {};

      if (societyId) {
        query.society = new Types.ObjectId(societyId);
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'amenities': { $regex: search, $options: 'i' } }
        ];
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      if (hasAvailability === true) {
        query.availableSlots = { $gt: 0 };
      }

      const skip = (page - 1) * limit;

      const [facilities, total] = await Promise.all([
        Facility.find(query)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit),
        Facility.countDocuments(query)
      ]);

      return { facilities, total };
    } catch (error) {
      logError('FacilityService', error as Error, { page, limit, search });
      throw new AppError('Failed to get facilities', 500);
    }
  }

  static async getFacilityById(id: string): Promise<IFacility> {
    try {
      const facility = await Facility.findById(id);
      if (!facility) {
        throw new AppError('Facility not found', 404);
      }
      return facility;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { id });
      throw new AppError('Failed to get facility', 500);
    }
  }

  static async updateFacility(
    id: string,
    input: UpdateFacilityInput,
    userId: string
  ): Promise<IFacility> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can update facilities', 403);
      }

      const facility = await Facility.findById(id);
      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // If name is being changed, check for duplicates
      if (input.name && input.name !== facility.name) {
        const existingFacility = await Facility.findOne({
          name: input.name,
          society: user.society,
          _id: { $ne: id }
        });
        if (existingFacility) {
          throw new AppError('Facility with this name already exists', 400);
        }
      }

      // If capacity is reduced, ensure availableSlots doesn't exceed new capacity
      if (input.capacity && input.capacity < facility.capacity) {
        if (facility.availableSlots > input.capacity) {
          input.availableSlots = input.capacity;
        }
      }

      Object.assign(facility, input);
      await facility.save();

      logInfo('FacilityService', `Facility updated: ${facility.name}`, { userId });
      return facility;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { id, input, userId });
      throw new AppError('Failed to update facility', 500);
    }
  }

  static async deleteFacility(id: string, userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can delete facilities', 403);
      }

      const facility = await Facility.findById(id);
      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // Check if there are any active bookings for this facility
      const activeBookings = await Booking.countDocuments({
        facility: id,
        status: { $in: [BookingStatus.BOOKED, BookingStatus.PENDING] }
      });

      if (activeBookings > 0) {
        throw new AppError(`Cannot delete facility with ${activeBookings} active bookings. Please cancel all bookings first.`, 400);
      }

      await facility.deleteOne();
      logInfo('FacilityService', `Facility deleted: ${facility.name}`, { userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { id, userId });
      throw new AppError('Failed to delete facility', 500);
    }
  }

  // ============ BOOKING CRUD ============

  static async createBooking(
    input: CreateBookingInput,
    userId: string
  ): Promise<IBooking> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const facility = await Facility.findById(input.facilityId);
      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // Check if facility is active
      if (!facility.isActive) {
        throw new AppError('Facility is currently not available', 400);
      }

      // Check if facility has available slots
      if (facility.availableSlots <= 0) {
        throw new AppError('No slots available for this facility', 400);
      }

      // Check if booking date is within operating hours
      if (facility.operatingHours) {
        const { start, end } = facility.operatingHours;
        if (input.startTime < start || input.endTime > end) {
          throw new AppError(`Booking must be within operating hours (${start} - ${end})`, 400);
        }
      }

      // Check for conflicting bookings
      const conflictingBooking = await Booking.findOne({
        facility: input.facilityId,
        date: input.date,
        status: { $in: [BookingStatus.BOOKED, BookingStatus.PENDING] },
        $or: [
          {
            startTime: { $lt: input.endTime },
            endTime: { $gt: input.startTime }
          }
        ]
      });

      if (conflictingBooking) {
        throw new AppError('Time slot is already booked', 400);
      }

      // Check if user has any overlapping bookings
      const userBooking = await Booking.findOne({
        user: userId,
        date: input.date,
        status: { $in: [BookingStatus.BOOKED, BookingStatus.PENDING] },
        $or: [
          {
            startTime: { $lt: input.endTime },
            endTime: { $gt: input.startTime }
          }
        ]
      });

      if (userBooking) {
        throw new AppError('You already have a booking at this time', 400);
      }

      // Create booking
      const booking = await Booking.create({
        facility: input.facilityId,
        user: userId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        attendees: input.attendees || 1,
        notes: input.notes,
        specialRequests: input.specialRequests,
        status: BookingStatus.BOOKED,
        society: user.society
      });

      // Decrease available slots
      facility.availableSlots -= 1;
      await facility.save();

      await booking.populate('facility', 'name description');
      await booking.populate('user', 'name email flatNumber');

      logInfo('FacilityService', `Booking created: ${booking.bookingReference}`, { userId });
      return booking;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { input, userId });
      throw new AppError('Failed to create booking', 500);
    }
  }

  static async getBookings(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<{ bookings: IBooking[]; total: number }> {
    try {
      const query: any = {};

      if (userRole !== 'admin') {
        query.user = new Types.ObjectId(userId);
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.facilityId) {
        query.facility = new Types.ObjectId(filters.facilityId);
      }

      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) {
          query.date.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.date.$lte = filters.endDate;
        }
      }

      const skip = (page - 1) * limit;

      const [bookings, total] = await Promise.all([
        Booking.find(query)
          .sort({ date: -1, startTime: -1 })
          .skip(skip)
          .limit(limit)
          .populate('facility', 'name description')
          .populate('user', 'name email flatNumber'),
        Booking.countDocuments(query)
      ]);

      return { bookings, total };
    } catch (error) {
      logError('FacilityService', error as Error, { userId, filters });
      throw new AppError('Failed to get bookings', 500);
    }
  }

  static async getBookingById(id: string): Promise<IBooking> {
    try {
      const booking = await Booking.findById(id)
        .populate('facility', 'name description')
        .populate('user', 'name email flatNumber');

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }
      return booking;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { id });
      throw new AppError('Failed to get booking', 500);
    }
  }

  static async updateBookingStatus(
    id: string,
    status: BookingStatus,
    userId: string
  ): Promise<IBooking> {
    try {
      const booking = await Booking.findById(id);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check permissions
      if (booking.user.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to update this booking', 403);
      }

      // If cancelling, increase available slots
      if (status === BookingStatus.CANCELLED && booking.status !== BookingStatus.CANCELLED) {
        const facility = await Facility.findById(booking.facility);
        if (facility) {
          facility.availableSlots += 1;
          await facility.save();
        }
        booking.cancelledAt = new Date();
      }

      // If completing
      if (status === BookingStatus.COMPLETED) {
        booking.completedAt = new Date();
      }

      booking.status = status;
      await booking.save();

      await booking.populate('facility', 'name description');
      await booking.populate('user', 'name email');

      logInfo('FacilityService', `Booking status updated: ${booking.bookingReference} to ${status}`, { userId });
      return booking;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { id, status, userId });
      throw new AppError('Failed to update booking', 500);
    }
  }

  static async cancelBooking(id: string, userId: string): Promise<IBooking> {
    return this.updateBookingStatus(id, BookingStatus.CANCELLED, userId);
  }

  static async deleteBooking(id: string, userId: string): Promise<void> {
    try {
      const booking = await Booking.findById(id);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (booking.user.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to delete this booking', 403);
      }

      // Increase available slots if booking was active
      if (booking.status === BookingStatus.BOOKED || booking.status === BookingStatus.PENDING) {
        const facility = await Facility.findById(booking.facility);
        if (facility) {
          facility.availableSlots += 1;
          await facility.save();
        }
      }

      await booking.deleteOne();
      logInfo('FacilityService', `Booking deleted: ${booking.bookingReference}`, { userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { id, userId });
      throw new AppError('Failed to delete booking', 500);
    }
  }

  // ============ STATISTICS ============

  static async getFacilityStats(societyId: string): Promise<any> {
    try {
      const totalFacilities = await Facility.countDocuments({ society: new Types.ObjectId(societyId) });
      const activeFacilities = await Facility.countDocuments({ 
        society: new Types.ObjectId(societyId),
        isActive: true 
      });
      
      const availableFacilities = await Facility.countDocuments({
        society: new Types.ObjectId(societyId),
        isActive: true,
        availableSlots: { $gt: 0 }
      });

      const totalBookings = await Booking.countDocuments({ 
        society: new Types.ObjectId(societyId) 
      });
      
      const activeBookings = await Booking.countDocuments({
        society: new Types.ObjectId(societyId),
        status: BookingStatus.BOOKED
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayBookings = await Booking.countDocuments({
        society: new Types.ObjectId(societyId),
        date: { $gte: today },
        status: BookingStatus.BOOKED
      });

      const facilityUsage = await Booking.aggregate([
        { $match: { society: new Types.ObjectId(societyId) } },
        { $group: {
          _id: '$facility',
          bookings: { $sum: 1 }
        }},
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        { $lookup: {
          from: 'facilities',
          localField: '_id',
          foreignField: '_id',
          as: 'facility'
        }},
        { $unwind: '$facility' },
        { $project: {
          name: '$facility.name',
          bookings: 1
        }}
      ]);

      return {
        totalFacilities,
        activeFacilities,
        availableFacilities,
        totalBookings,
        activeBookings,
        todayBookings,
        topFacilities: facilityUsage
      };
    } catch (error) {
      logError('FacilityService', error as Error, { societyId });
      throw new AppError('Failed to get facility statistics', 500);
    }
  }

  static async getAvailableSlots(
    facilityId: string,
    date: Date
  ): Promise<any> {
    try {
      const facility = await Facility.findById(facilityId);
      if (!facility) {
        throw new AppError('Facility not found', 404);
      }

      // Get all bookings for the date
      const bookings = await Booking.find({
        facility: facilityId,
        date: date,
        status: { $in: [BookingStatus.BOOKED, BookingStatus.PENDING] }
      });

      // Generate time slots (e.g., hourly)
      const slots = [];
      const startHour = 8; // 8 AM
      const endHour = 22; // 10 PM

      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        // Check if slot is available
        const isBooked = bookings.some(b => 
          b.startTime <= startTime && b.endTime > startTime
        );

        slots.push({
          startTime,
          endTime,
          isAvailable: !isBooked
        });
      }

      return {
        facility: facility.name,
        date,
        totalSlots: slots.length,
        availableSlots: slots.filter(s => s.isAvailable).length,
        slots
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError('FacilityService', error as Error, { facilityId, date });
      throw new AppError('Failed to get available slots', 500);
    }
  }
}

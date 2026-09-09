import { Event, IEvent } from '../../models/Event';
import { User } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  maxAttendees?: number;
  isVirtual?: boolean;
  meetingLink?: string;
  image?: string;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  maxAttendees?: number;
  isVirtual?: boolean;
  meetingLink?: string;
  image?: string;
}

export class EventService {
  static async createEvent(
    input: CreateEventInput,
    userId: string
  ): Promise<IEvent> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const event = await Event.create({
        ...input,
        organizer: userId
      });

      await event.populate('organizer', 'name email');

      logger.info(`Event created: ${event.title} by ${userId}`);
      return event;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create event error:', error);
      throw new AppError('Failed to create event', 500);
    }
  }

  static async getEvents(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<{ events: IEvent[]; total: number }> {
    try {
      const query: any = {};

      if (filters.startDate) {
        query.startDate = { $gte: filters.startDate };
      }

      if (filters.endDate) {
        query.endDate = { $lte: filters.endDate };
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [events, total] = await Promise.all([
        Event.find(query)
          .sort({ startDate: 1 })
          .skip(skip)
          .limit(limit)
          .populate('organizer', 'name email')
          .populate('attendees.user', 'name email flatNumber'),
        Event.countDocuments(query)
      ]);

      return { events, total };
    } catch (error) {
      logger.error('Get events error:', error);
      throw new AppError('Failed to get events', 500);
    }
  }

  static async getEventById(id: string): Promise<IEvent> {
    try {
      const event = await Event.findById(id)
        .populate('organizer', 'name email phone')
        .populate('attendees.user', 'name email flatNumber wing');

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      return event;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get event error:', error);
      throw new AppError('Failed to get event', 500);
    }
  }

  static async updateEvent(
    id: string,
    input: UpdateEventInput,
    userId: string
  ): Promise<IEvent> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const event = await Event.findById(id);
      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check if user is organizer or admin
      if (event.organizer.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to update this event', 403);
      }

      Object.assign(event, input);
      await event.save();

      await event.populate('organizer', 'name email');

      logger.info(`Event updated: ${id} by ${userId}`);
      return event;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update event error:', error);
      throw new AppError('Failed to update event', 500);
    }
  }

  static async deleteEvent(id: string, userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const event = await Event.findById(id);
      if (!event) {
        throw new AppError('Event not found', 404);
      }

      if (event.organizer.toString() !== userId && user.role !== 'admin') {
        throw new AppError('You do not have permission to delete this event', 403);
      }

      await event.deleteOne();
      logger.info(`Event deleted: ${id} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete event error:', error);
      throw new AppError('Failed to delete event', 500);
    }
  }

  static async rsvpToEvent(
    id: string,
    userId: string,
    status: 'going' | 'maybe' | 'not_going'
  ): Promise<IEvent> {
    try {
      const event = await Event.findById(id);
      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check if event has started
      if (new Date(event.startDate) < new Date()) {
        throw new AppError('Cannot RSVP to past events', 400);
      }

      // Check if max attendees reached
      if (status === 'going' && event.maxAttendees) {
        const goingCount = event.attendees.filter(a => a.status === 'going').length;
        if (goingCount >= event.maxAttendees) {
          throw new AppError('Event is full', 400);
        }
      }

      // Find existing RSVP
      const existingAttendee = event.attendees.find(
        a => a.user.toString() === userId
      );

      if (existingAttendee) {
        existingAttendee.status = status;
        existingAttendee.registeredAt = new Date();
      } else {
        event.attendees.push({
          user: new Types.ObjectId(userId),
          status,
          registeredAt: new Date()
        });
      }

      await event.save();
      await event.populate('attendees.user', 'name email flatNumber');

      logger.info(`RSVP updated for event ${id} by user ${userId}: ${status}`);
      return event;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('RSVP error:', error);
      throw new AppError('Failed to RSVP to event', 500);
    }
  }

  static async getEventAttendees(id: string): Promise<any> {
    try {
      const event = await Event.findById(id)
        .populate('attendees.user', 'name email flatNumber wing phone');

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      const stats = {
        total: event.attendees.length,
        going: event.attendees.filter(a => a.status === 'going').length,
        maybe: event.attendees.filter(a => a.status === 'maybe').length,
        notGoing: event.attendees.filter(a => a.status === 'not_going').length
      };

      return { attendees: event.attendees, stats };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get attendees error:', error);
      throw new AppError('Failed to get event attendees', 500);
    }
  }
}
import { EmergencyContact, IEmergencyContact } from '../../models/EmergencyContact';
import { User } from '../../models/User';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

interface CreateEmergencyContactInput {
  name: string;
  phone: string;
  designation: string;
  email?: string;
  address?: string;
  priority?: number;
}

interface UpdateEmergencyContactInput {
  name?: string;
  phone?: string;
  designation?: string;
  email?: string;
  address?: string;
  priority?: number;
  isActive?: boolean;
}

export class EmergencyService {
  static async createContact(
    input: CreateEmergencyContactInput,
    userId: string
  ): Promise<IEmergencyContact> {
    try {
      // Check if user is admin
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can create emergency contacts', 403);
      }

      const contact = await EmergencyContact.create({
        ...input,
        society: user.society
      });

      logger.info(`Emergency contact created: ${contact.name} by ${userId}`);
      return contact;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create emergency contact error:', error);
      throw new AppError('Failed to create emergency contact', 500);
    }
  }

  static async getContacts(
    filters: any,
    page: number = 1,
    limit: number = 10,
    societyId?: string
  ): Promise<{ contacts: IEmergencyContact[]; total: number }> {
    try {
      const query: any = { isActive: true };

      if (societyId) {
        query.society = new Types.ObjectId(societyId);
      }

      if (filters.designation) {
        query.designation = { $regex: filters.designation, $options: 'i' };
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { designation: { $regex: filters.search, $options: 'i' } },
          { phone: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [contacts, total] = await Promise.all([
        EmergencyContact.find(query)
          .sort({ priority: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        EmergencyContact.countDocuments(query)
      ]);

      return { contacts, total };
    } catch (error) {
      logger.error('Get emergency contacts error:', error);
      throw new AppError('Failed to get emergency contacts', 500);
    }
  }

  static async getContactById(id: string): Promise<IEmergencyContact> {
    try {
      const contact = await EmergencyContact.findById(id);
      if (!contact) {
        throw new AppError('Emergency contact not found', 404);
      }
      return contact;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get emergency contact error:', error);
      throw new AppError('Failed to get emergency contact', 500);
    }
  }

  static async updateContact(
    id: string,
    input: UpdateEmergencyContactInput,
    userId: string
  ): Promise<IEmergencyContact> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can update emergency contacts', 403);
      }

      const contact = await EmergencyContact.findById(id);
      if (!contact) {
        throw new AppError('Emergency contact not found', 404);
      }

      Object.assign(contact, input);
      await contact.save();

      logger.info(`Emergency contact updated: ${id} by ${userId}`);
      return contact;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update emergency contact error:', error);
      throw new AppError('Failed to update emergency contact', 500);
    }
  }

  static async deleteContact(id: string, userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'admin') {
        throw new AppError('Only admins can delete emergency contacts', 403);
      }

      const contact = await EmergencyContact.findById(id);
      if (!contact) {
        throw new AppError('Emergency contact not found', 404);
      }

      await contact.deleteOne();
      logger.info(`Emergency contact deleted: ${id} by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete emergency contact error:', error);
      throw new AppError('Failed to delete emergency contact', 500);
    }
  }
}
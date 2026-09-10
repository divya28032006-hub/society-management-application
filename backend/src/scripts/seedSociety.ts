import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Society } from '../models/Society';
import { User, UserRole } from '../models/User';
import { EmergencyContact } from '../models/EmergencyContact';
import { Facility } from '../models/Facility';
import logger from '../utils/logger';

dotenv.config();

const seedSociety = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/society-management';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding');

    // 1. Create or fetch Society
    const societyData = {
      name: 'Green Valley Society',
      address: '123 Main Road, Sector 12',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      totalFlats: 100,
      totalWings: 4,
      establishedYear: 2010,
      amenities: ['Swimming Pool', 'Gym', 'Garden', 'Club House', 'Playground'],
      contactEmail: 'admin@greenvalley.com',
      contactPhone: '9876543210'
    };

    let society = await Society.findOne({ name: societyData.name });
    if (!society) {
      society = await Society.create(societyData);
      logger.info(`Created Society: ${society.name} (ID: ${society._id})`);
    } else {
      logger.info(`Existing Society found: ${society.name} (ID: ${society._id})`);
    }

    const societyId = society._id;

    // 2. Create Users (Admin, Resident, Security)
    const seedUsers = [
      {
        name: 'Society Admin',
        email: 'admin@greenvalley.com',
        phone: '9876543210',
        password: 'Password123!',
        role: UserRole.ADMIN,
        society: societyId
      },
      {
        name: 'John Resident',
        email: 'resident@greenvalley.com',
        phone: '9876543211',
        password: 'Password123!',
        role: UserRole.RESIDENT,
        flatNumber: '101',
        wing: 'A',
        society: societyId
      },
      {
        name: 'Gate Guard Security',
        email: 'security@greenvalley.com',
        phone: '9876543212',
        password: 'Password123!',
        role: UserRole.SECURITY,
        society: societyId
      }
    ];

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        logger.info(`Created user: ${user.name} (${user.role}) - ${user.email}`);
      } else {
        logger.info(`User already exists: ${existingUser.email} (${existingUser.role})`);
      }
    }

    const emergencyContacts = [
      { name: 'Green Valley Security Desk', designation: 'Society Security', phone: '9876543212', priority: 5, address: 'Main Gate, Green Valley Society' },
      { name: 'Mumbai Fire Brigade', designation: 'Fire Emergency', phone: '101', priority: 5, address: 'Mumbai Fire Control Room' },
      { name: 'Emergency Ambulance', designation: 'Medical Emergency', phone: '108', priority: 5 },
      { name: 'Priya Sharma', designation: 'Society Manager', phone: '9876543213', email: 'manager@greenvalley.com', priority: 4 }
    ];

    for (const contact of emergencyContacts) {
      await EmergencyContact.updateOne(
        { society: societyId, designation: contact.designation },
        { $set: { ...contact, society: societyId, isActive: true } },
        { upsert: true }
      );
    }

    const facilities = [
      { name: 'Clubhouse', description: 'Air-conditioned community room for meetings and small gatherings.', capacity: 50, availableSlots: 50, bookingFee: 500, operatingHours: { start: '08:00', end: '22:00' }, amenities: ['Projector', 'Air conditioning', 'Sound system'], rules: ['Book at least 24 hours ahead', 'Return the room clean'] },
      { name: 'Swimming Pool', description: 'Resident swimming pool with lifeguard-supervised access.', capacity: 20, availableSlots: 20, bookingFee: 100, operatingHours: { start: '06:00', end: '21:00' }, amenities: ['Changing rooms', 'Lifeguard'], rules: ['Swim cap required', 'Children require adult supervision'] },
      { name: 'Fitness Centre', description: 'Well-equipped gym for daily resident workouts and fitness sessions.', capacity: 15, availableSlots: 15, bookingFee: 0, operatingHours: { start: '05:30', end: '22:00' }, amenities: ['Treadmills', 'Weights', 'Yoga mats'], rules: ['Carry a towel', 'Wipe equipment after use'] },
      { name: 'Party Hall', description: 'Spacious hall for celebrations, events, and family functions.', capacity: 100, availableSlots: 100, bookingFee: 1500, operatingHours: { start: '10:00', end: '23:00' }, amenities: ['Kitchenette', 'Stage', 'Tables and chairs'], rules: ['Booking requires manager approval', 'Music ends by 22:00'] }
    ];

    for (const facility of facilities) {
      await Facility.updateOne(
        { society: societyId, name: facility.name },
        { $set: { ...facility, society: societyId, isActive: true } },
        { upsert: true }
      );
    }

    logger.info('--- SEEDING COMPLETED SUCCESSFULLY ---');
    logger.info('Demo Credentials:');
    logger.info('Admin: admin@greenvalley.com / Password123!');
    logger.info('Resident: resident@greenvalley.com / Password123!');
    logger.info('Security: security@greenvalley.com / Password123!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding society data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedSociety();

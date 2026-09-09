import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Society } from '../models/Society';
import { User, UserRole } from '../models/User';
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
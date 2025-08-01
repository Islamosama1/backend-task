import { Model } from 'mongoose';
import { Property } from '../src/database/schemas/property.schema';
import { Types } from 'mongoose';

export const properties = [
  {
    _id: new Types.ObjectId().toString(),
    organizationId: new Types.ObjectId().toString(),
    bua: 120,
    totalBua: 150,
    landArea: 200,
    price: 2500000,
    beds: 3,
    bathrooms: 2,
    buildingId: 'BLD-001',
    unitId: 'UNIT-101',
    amenities: ['Swimming Pool', 'Gym', 'Security', 'Parking'],
    compoundId: new Types.ObjectId().toString(),
    availabilityDays: ['Saturday', 'Sunday'],
  },
  {
    _id: new Types.ObjectId().toString(),
    organizationId: new Types.ObjectId().toString(),
    bua: 85,
    totalBua: 100,
    landArea: 150,
    price: 1800000,
    beds: 2,
    bathrooms: 2,
    buildingId: 'BLD-002',
    unitId: 'UNIT-202',
    amenities: ['Garden', 'Playground', '24/7 Security', 'Underground Parking'],
    compoundId: new Types.ObjectId().toString(),
    availabilityDays: ['Monday', 'Tuesday', 'Thursday'],
  },
  {
    _id: new Types.ObjectId().toString(),
    organizationId: new Types.ObjectId().toString(),
    bua: 200,
    totalBua: 250,
    landArea: 300,
    price: 4500000,
    beds: 4,
    bathrooms: 3,
    buildingId: 'BLD-003',
    unitId: 'UNIT-303',
    amenities: ['Private Pool', 'Smart Home', 'Garden', 'Security', 'Parking'],
    compoundId: new Types.ObjectId().toString(),
    availabilityDays: [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
    ],
  },
  {
    _id: new Types.ObjectId().toString(),
    organizationId: new Types.ObjectId().toString(),
    bua: 65,
    totalBua: 80,
    landArea: 100,
    price: 1200000,
    beds: 1,
    bathrooms: 1,
    buildingId: 'BLD-004',
    unitId: 'UNIT-404',
    amenities: ['Security', 'Parking', 'Gym'],
    compoundId: new Types.ObjectId().toString(),
    availabilityDays: [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
    ],
  },
  {
    _id: new Types.ObjectId().toString(),
    organizationId: new Types.ObjectId().toString(),
    bua: 150,
    totalBua: 180,
    landArea: 250,
    price: 3200000,
    beds: 3,
    bathrooms: 2.5,
    buildingId: 'BLD-005',
    unitId: 'UNIT-505',
    amenities: [
      'Swimming Pool',
      'Gym',
      'Security',
      'Parking',
      'Garden',
      'Playground',
    ],
    compoundId: new Types.ObjectId().toString(),
    availabilityDays: [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
    ],
  },
];

export const seedUnits = async (model: Model<Property>) => {
  await model.insertMany(properties);
};

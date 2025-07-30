import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, Model, connect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AppModule } from '../src/app.module';
import { PropertyViewing, PropertyViewingSchema } from '../src/database/schemas/property-viewing.schema';
import { Property, PropertySchema } from '../src/database/schemas/property.schema';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { JWT_SECRET } from '../src/auth/constants/constants';

describe('PropertyViewingsController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let propertyModel: Model<Property>;
  let propertyViewingModel: Model<PropertyViewing>;
  let jwtService: JwtService;
  let testProperty: Property;
  let authToken: string;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            database: {
              uri,
            },
          })],
        }),
        AppModule,
        PassportModule,
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        JwtStrategy,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get models
    propertyModel = moduleFixture.get<Model<Property>>(getModelToken(Property.name));
    propertyViewingModel = moduleFixture.get<Model<PropertyViewing>>(getModelToken(PropertyViewing.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generate test JWT token
    authToken = jwtService.sign({ email: 'test@example.com', sub: '123' });

    // Create a test property
    testProperty = await propertyModel.create({
      organizationId: 'org123',
      bua: 100,
      totalBua: 100,
      landArea: 200,
      price: 1000000,
      beds: 3,
      bathrooms: 2,
      buildingId: 'bldg1',
      unitId: 'unit1',
      amenities: ['pool', 'gym'],
      compoundId: 'compound1',
      availabilityDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    });
  });

  afterAll(async () => {
    await propertyModel.deleteMany({});
    await propertyViewingModel.deleteMany({});
    await mongoServer.stop();
    await app.close();
  });

  describe('/property-viewings (POST)', () => {
    it('should schedule a new property viewing', async () => {
      // Set the date to 2 days from now to ensure it's more than 24 hours ahead
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      futureDate.setUTCHours(10, 0, 0, 0);

      const endTime = new Date(futureDate);
      endTime.setUTCHours(10, 30, 0, 0);

      const requestBody = {
        propertyId: testProperty._id.toString(),
        startTime: futureDate.toISOString(),
        endTime: endTime.toISOString(),
        notes: 'Test viewing',
      };

      console.log('Sending request with body:', JSON.stringify(requestBody, null, 2));

      const response = await request(app.getHttpServer())
        .post('/property-viewings/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);

      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(201);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.propertyId).toBe(testProperty._id.toString());
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 409 for conflicting time slots', async () => {
      // Set the date to 2 days from now to ensure it's more than 24 hours ahead
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      futureDate.setUTCHours(11, 0, 0, 0);

      const endTime = new Date(futureDate);
      endTime.setUTCHours(11, 30, 0, 0);

      // First request should succeed
      const firstResponse = await request(app.getHttpServer())
        .post('/property-viewings/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyId: testProperty._id.toString(),
          startTime: futureDate.toISOString(),
          endTime: endTime.toISOString(),
        });

      expect(firstResponse.status).toBe(201);

      // Second request with overlapping time should fail
      const response = await request(app.getHttpServer())
        .post('/property-viewings/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyId: testProperty._id.toString(),
          startTime: futureDate.toISOString(),
          endTime: endTime.toISOString(),
          notes: 'Test viewing',
        });

      expect(response.status).toBe(409);

      expect(response.body.message).toContain('already a viewing scheduled');
    });
  });

  describe('/property-viewings/available-slots/:propertyId (GET)', () => {
    it('should return available time slots', async () => {
      // Create a date for the test
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 2);
      testDate.setUTCHours(0, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .get(`/property-viewings/available-slots/${testProperty._id}`)
        .query({ date: testDate.toISOString().split('T')[0] })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('/property-viewings/my-viewings (GET)', () => {
    it('should return user\'s viewings', async () => {
      const response = await request(app.getHttpServer())
        .get('/property-viewings/my-viewings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
    });
  });

  describe('/property-viewings/:id (DELETE)', () => {
    it('should cancel a viewing', async () => {
      // Set the date to 2 days from now to ensure it's more than 24 hours ahead
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      futureDate.setUTCHours(14, 0, 0, 0);

      const endTime = new Date(futureDate);
      endTime.setUTCHours(14, 30, 0, 0);

      // Schedule a viewing
      const scheduleResponse = await request(app.getHttpServer())
        .post('/property-viewings/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyId: testProperty._id.toString(),
          startTime: futureDate.toISOString(),
          endTime: endTime.toISOString(),
        });

      const viewing = scheduleResponse.body.data;

      // Cancel the viewing
      const response = await request(app.getHttpServer())
        .delete(`/property-viewings/${viewing._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.status).toBe('cancelled');
    });
  });
});

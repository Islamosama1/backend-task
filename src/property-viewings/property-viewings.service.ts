import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PropertyViewing } from '../database/schemas/property-viewing.schema';
import { PropertiesService } from '../properties/properties.service';
import { ViewingStatus } from '../database/enums/viewing-status.enum';
import { AvailableSlot } from './interfaces/available-slots.interface';



@Injectable()
export class PropertyViewingsService {
  constructor(
    @InjectModel(PropertyViewing.name)
    private readonly propertyViewingModel: Model<PropertyViewing>,
    private readonly propertiesService: PropertiesService,
  ) { }

  async scheduleViewing(
    propertyId: string,
    userId: string,
    startTime: Date,
    endTime: Date,
    notes?: string,
  ): Promise<PropertyViewing> {
    try {
      this.validateTimeSlot(startTime, endTime);

      const property = await this.propertiesService.findById(propertyId);
      if (!property) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }

      const hasConflict = await this.hasViewingConflict(propertyId, startTime, endTime);
      if (hasConflict) {
        throw new ConflictException('There is already a viewing scheduled for this time slot');
      }

      const viewing = await this.propertyViewingModel.create({
        propertyId: new Types.ObjectId(propertyId),
        userId,
        startTime,
        endTime,
        notes,
        status: ViewingStatus.PENDING,
      });

      return JSON.parse(JSON.stringify(viewing.toObject({ getters: true, versionKey: false })));
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      throw error;
    }
  }

  async getAvailableSlots(
    propertyId: string,
    date: Date,
    durationInMinutes: number = 30,
  ): Promise<AvailableSlot[]> {
    const property = await this.propertiesService.findById(propertyId);
    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM

    const endOfDay = new Date(date);
    endOfDay.setHours(18, 0, 0, 0); // End at 6 PM

    // Get all viewings for this property on the given day
    const viewings = await this.propertyViewingModel.find({
      propertyId,
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $ne: ViewingStatus.CANCELLED },
    }).sort('startTime');

    // Generate 30-minute slots from 9 AM to 6 PM
    const slots: AvailableSlot[] = [];
    const slotDurationMs = durationInMinutes * 60 * 1000;
    const slotEnd = new Date(startOfDay.getTime() + slotDurationMs);

    while (slotEnd <= endOfDay) {
      const isAvailable = !viewings.some(viewing => {
        return (
          (startOfDay >= viewing.startTime && startOfDay < viewing.endTime) ||
          (slotEnd > viewing.startTime && slotEnd <= viewing.endTime) ||
          (startOfDay <= viewing.startTime && slotEnd >= viewing.endTime)
        );
      });

      slots.push({
        startTime: new Date(startOfDay),
        endTime: new Date(slotEnd),
        available: isAvailable,
      });

      // Move to next slot
      startOfDay.setTime(startOfDay.getTime() + slotDurationMs);
      slotEnd.setTime(slotEnd.getTime() + slotDurationMs);
    }

    return slots;
  }

  async getUserViewings(userId: string): Promise<PropertyViewing[]> {
    const viewings = await this.propertyViewingModel
      .find({ userId })
      .sort({ startTime: 1 })
      .populate('propertyId', 'title address price')
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(viewings));
  }

  async cancelViewing(viewingId: string, userId: string): Promise<PropertyViewing> {
    const viewing = await this.propertyViewingModel.findOneAndUpdate(
      { _id: viewingId, userId },
      { status: ViewingStatus.CANCELLED },
      { new: true },
    );

    if (!viewing) {
      throw new NotFoundException(`Viewing with ID ${viewingId} not found or you don't have permission to cancel it`);
    }

    return viewing;
  }

  private async hasViewingConflict(
    propertyId: string,
    startTime: Date,
    endTime: Date,
    excludeViewingId?: string,
  ): Promise<boolean> {
    const query: any = {
      propertyId,
      status: { $ne: ViewingStatus.CANCELLED },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gte: endTime } }] },
      ],
    };

    if (excludeViewingId) {
      query._id = { $ne: excludeViewingId };
    }

    const count = await this.propertyViewingModel.countDocuments(query);
    return count > 0;
  }

  private validateTimeSlot(startTime: Date, endTime: Date): void {
    const now = new Date();
    const minStartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < minStartTime) {
      throw new BadRequestException('Viewing must be scheduled at least 24 hours in advance');
    }

    const slotDurationMs = endTime.getTime() - startTime.getTime();
    const minDurationMs = 30 * 60 * 1000; // 30 minutes
    const maxDurationMs = 2 * 60 * 60 * 1000; // 2 hours

    if (slotDurationMs < minDurationMs || slotDurationMs > maxDurationMs) {
      throw new BadRequestException('Viewing duration must be between 30 minutes and 2 hours');
    }

    // Check if the time is within business hours (9 AM to 6 PM)
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();

    if (startHour < 9 || endHour > 18 || (endHour === 18 && endTime.getMinutes() > 0)) {
      throw new BadRequestException('Viewings can only be scheduled between 9 AM and 6 PM');
    }
  }
}

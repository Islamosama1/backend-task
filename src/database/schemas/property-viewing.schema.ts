import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Property } from './property.schema';
import { ViewingStatus } from '../enums/viewing-status.enum';
import { IPropertyViewing } from '../interfaces/property-viewing.interface';


@Schema({ timestamps: true })
export class PropertyViewing extends Document implements IPropertyViewing {

  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String })
  agentId?: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({
    type: String,
    enum: Object.values(ViewingStatus),
    default: ViewingStatus.PENDING
  })
  status: ViewingStatus;

  @Prop({ type: String })
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type PropertyViewingDocument = PropertyViewing & Document;
export const PropertyViewingSchema = SchemaFactory.createForClass(PropertyViewing);

// Compound index to prevent double bookings and speed up queries
PropertyViewingSchema.index(
  { propertyId: 1, startTime: 1, endTime: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: ViewingStatus.CANCELLED } } }
);

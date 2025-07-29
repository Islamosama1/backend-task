import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface IProperty {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  bua: number;
  totalBua: number;
  landArea: number;
  price: number;
  beds: number;
  bathrooms: number;
  buildingId: string;
  unitId: string;
  amenities: string[];
  compoundId: Types.ObjectId;
  availabilityDays: string[];
}

@Schema({ timestamps: true })
export class Property implements IProperty {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  bua: number;

  @Prop({ type: Number, required: true })
  totalBua: number;

  @Prop({ type: Number, required: true })
  landArea: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  beds: number;

  @Prop({ type: Number, required: true })
  bathrooms: number;

  @Prop({ type: String, required: true })
  buildingId: string;

  @Prop({ type: String, required: true })
  unitId: string;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ type: Types.ObjectId, required: true })
  compoundId: Types.ObjectId;

  @Prop({ type: [String], required: true })
  availabilityDays: string[];
}

export type PropertyDocument = Property & Document;
// Create the schema
const schema = SchemaFactory.createForClass(Property);

export const PropertySchema = schema;

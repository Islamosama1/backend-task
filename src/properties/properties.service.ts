import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Property } from '../database/schemas/property.schema';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) { }

  async findAll(): Promise<any[]> {
    const properties = await this.propertyModel.find().lean().exec();
    return properties.map(property => ({
      ...property,
      _id: property._id.toString()
    }));
  }

  async findById(id: string | Buffer | Types.ObjectId): Promise<Property> {
    let query: any;

    // If id is a Buffer, convert it to ObjectId
    if (Buffer.isBuffer(id)) {
      query = { _id: new Types.ObjectId(id) };
    } else {
      query = { _id: id };
    }

    const property = await this.propertyModel.findOne(query).exec();
    if (!property) {
      throw new NotFoundException(`Property not found`);
    }
    return property;
  }
}

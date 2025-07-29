import { Controller, Get, Param } from '@nestjs/common';
import { Document } from 'mongoose';
import { PropertiesService } from './properties.service';
import { Property } from '../database/schemas/property.schema';
import { HTTPResponse } from '../common/http/response';

type PropertyDocument = Property & Document & {
  toJSON(): any;
};

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) { }

  @Get()
  async findAll(): Promise<HTTPResponse<Property[]>> {
    return {
      data: await this.propertiesService.findAll(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HTTPResponse<any>> {
    const property = await this.propertiesService.findById(id) as unknown as PropertyDocument;
    
    // Convert the Mongoose document to a plain JavaScript object
    const propertyObj = property.toJSON();
    
    // Convert Buffer ID to string if it exists
    if (propertyObj._id && propertyObj._id.buffer && Array.isArray(propertyObj._id.buffer.data)) {
      propertyObj._id = Buffer.from(propertyObj._id.buffer.data).toString('hex');
    }
    
    return {
      data: propertyObj,
    };
  }
}

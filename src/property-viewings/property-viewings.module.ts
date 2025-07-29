import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyViewing, PropertyViewingSchema } from '../database/schemas/property-viewing.schema';
import { PropertyViewingsService } from './property-viewings.service';
import { PropertyViewingsController } from './property-viewings.controller';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyViewing.name, schema: PropertyViewingSchema },
    ]),
    PropertiesModule,
  ],
  controllers: [PropertyViewingsController],
  providers: [PropertyViewingsService],
  exports: [PropertyViewingsService],
})
export class PropertyViewingsModule { }

import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  BadRequestException,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { PropertyViewingsService } from './property-viewings.service';
import { PropertyViewing, ViewingStatus } from '../database/schemas/property-viewing.schema';
import { HTTPResponse } from '../common/http/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import { IsString, IsDateString, IsOptional, IsNotEmpty, IsEnum, IsNumber, Min, Max } from 'class-validator';

class ScheduleViewingRequestDto {
  @ApiProperty({
    description: 'ID of the property to schedule a viewing for',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'Start time of the viewing in ISO format',
    example: '2025-08-01T10:00:00.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time of the viewing in ISO format',
    example: '2025-08-01T10:30:00.000Z'
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the viewing',
    example: 'Interested in the property for investment purposes'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

class AvailableSlotsQueryDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format to check for available slots',
    example: '2025-08-01'
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description: 'Duration of the slot in minutes (default: 30)',
    minimum: 30,
    maximum: 120,
    default: 30
  })
  @IsNumber()
  @Min(30)
  @Max(120)
  @IsOptional()
  duration?: number = 30;
}

@ApiTags('Property Viewings')
@Controller('property-viewings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiResponse({
  status: 401,
  description: 'Unauthorized - JWT token is missing or invalid',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Unauthorized' },
      statusCode: { type: 'number', example: 401 },
    },
  },
})
export class PropertyViewingsController {
  constructor(private readonly propertyViewingsService: PropertyViewingsService) { }

  @Post('schedule')
  @ApiOperation({
    summary: 'Schedule a new property viewing',
    description: 'Schedule a new viewing for a property. The viewing must be scheduled at least 24 hours in advance.'
  })
  @ApiResponse({
    status: 201,
    description: 'Viewing scheduled successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/PropertyViewing' },
        message: { type: 'string', example: 'Viewing scheduled successfully' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or validation failed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Viewing must be scheduled at least 24 hours in advance' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Time slot is already booked',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'This time slot is already booked' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  @ApiBody({
    type: ScheduleViewingRequestDto,
    examples: {
      valid: {
        summary: 'Valid scheduling request',
        value: {
          propertyId: '507f1f77bcf86cd799439011',
          startTime: '2025-08-01T10:00:00.000Z',
          endTime: '2025-08-01T10:30:00.000Z',
          notes: 'Interested in the property for investment purposes'
        },
      },
    },
  })
  async scheduleViewing(
    @Request() req,
    @Body() scheduleViewingDto: ScheduleViewingRequestDto,
  ): Promise<HTTPResponse<PropertyViewing>> {
    const userId = req.user.userId; // Assuming JWT contains userId
    const { propertyId, startTime, endTime, notes } = scheduleViewingDto;
    console.log(req.user)
    // Validate dates
    if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const viewing = await this.propertyViewingsService.scheduleViewing(
      propertyId,
      userId,
      new Date(startTime),
      new Date(endTime),
      notes,
    );

    return {
      data: viewing,
      message: 'Viewing scheduled successfully',
    };
  }

  @Get('available-slots/:propertyId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get available time slots for a property',
    description: 'Retrieves a list of available time slots for scheduling a viewing on a specific date.'
  })
  @ApiParam({
    name: 'propertyId',
    description: 'ID of the property to check availability for',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
    example: '2025-08-01'
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    description: 'Duration of the slot in minutes (default: 30, min: 30, max: 120)',
    type: Number,
    example: 30
  })
  @ApiResponse({
    status: 200,
    description: 'List of available time slots',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/AvailableSlotResponseDto'
          }
        },
        message: { type: 'string', example: 'Available slots retrieved successfully' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format or duration',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid date format' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Property not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  async getAvailableSlots(
    @Param('propertyId') propertyId: string,
    @Query('date') date: string,
    @Query('duration', new ParseIntPipe({ optional: true })) duration: number = 30,
  ) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const slots = await this.propertyViewingsService.getAvailableSlots(
      propertyId,
      parsedDate,
      duration,
    );

    return {
      data: slots,
    };
  }

  @Get('my-viewings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all viewings for the authenticated user',
    description: 'Retrieves a list of all property viewings scheduled by the currently authenticated user.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of user\'s viewings',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/PropertyViewing'
          }
        },
        message: { type: 'string', example: 'Viewings retrieved successfully' }
      }
    }
  })
  async getUserViewings(
    @Request() req,
  ): Promise<HTTPResponse<PropertyViewing[]>> {
    const userId = req.user.userId;
    const viewings = await this.propertyViewingsService.getUserViewings(userId);
    return {
      data: viewings,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cancel a viewing',
    description: 'Cancels a scheduled property viewing. Only the user who scheduled the viewing can cancel it.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the viewing to cancel',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'Viewing cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/PropertyViewing' },
        message: { type: 'string', example: 'Viewing cancelled successfully' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to cancel this viewing',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'You are not authorized to cancel this viewing' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Viewing not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Viewing not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 },
      },
    },
  })
  async cancelViewing(
    @Request() req,
    @Param('id') viewingId: string,
  ): Promise<HTTPResponse<PropertyViewing>> {
    const userId = req.user.userId;
    const viewing = await this.propertyViewingsService.cancelViewing(viewingId, userId);

    return {
      data: viewing,
      message: 'Viewing cancelled successfully',
    };
  }
}

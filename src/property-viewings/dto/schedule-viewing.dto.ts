import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator";

export class ScheduleViewingRequestDto {
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
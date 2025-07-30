import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from "class-validator";

export class AvailableSlotsQueryDto {
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

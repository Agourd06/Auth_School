import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinLength, MaxLength, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateStudentsPlanningDto {
  @ApiProperty({ description: 'Planning period label', example: 'Semester 1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  period: string;

  @ApiProperty({ description: 'Teacher identifier', example: 7 })
  @Type(() => Number)
  @IsNumber()
  teacher_id: number;

  @ApiProperty({ description: 'Specialization identifier', example: 4 })
  @Type(() => Number)
  @IsNumber()
  specialization_id: number;

  @ApiProperty({ description: 'Course identifier', example: 12 })
  @Type(() => Number)
  @IsNumber()
  course_id: number;

  @ApiProperty({ description: 'Class identifier', example: 3 })
  @Type(() => Number)
  @IsNumber()
  class_id: number;

  @ApiProperty({ description: 'Class room identifier', example: 8 })
  @Type(() => Number)
  @IsNumber()
  class_room_id: number;

  @ApiProperty({ description: 'Planning session type identifier', example: 2 })
  @Type(() => Number)
  @IsNumber()
  planning_session_type_id: number;

  @ApiProperty({ description: 'Session date', example: '2025-11-10' })
  @IsDateString()
  date_day: string;

  @ApiProperty({ description: 'Start time (24h format)', example: '09:00' })
  @IsString()
  @Matches(TIME_REGEX)
  hour_start: string;

  @ApiProperty({ description: 'End time (24h format)', example: '11:00' })
  @IsString()
  @Matches(TIME_REGEX)
  hour_end: string;

  @ApiPropertyOptional({ description: 'Owning company identifier (automatically set from authenticated user)', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'School year identifier', example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  school_year_id?: number;

  @ApiPropertyOptional({ description: 'Status indicator (-2 to 2)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;
}

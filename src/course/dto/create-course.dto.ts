import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title displayed to students', example: 'Introduction to Physics' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Optional course description', example: 'Covers basic mechanics and thermodynamics.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Total number of instructional hours', example: 48 })
  @IsOptional()
  @IsNumber()
  volume?: number;

  @ApiPropertyOptional({ description: 'Coefficient or weight of the course', example: 2 })
  @IsOptional()
  @IsNumber()
  coefficient?: number;

  @ApiPropertyOptional({ description: 'Status indicator (-2 to 2)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;

  @ApiPropertyOptional({ description: 'Owning company identifier', example: 4 })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Modules linked to the course', example: [3, 8, 12] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  module_ids?: number[];
}

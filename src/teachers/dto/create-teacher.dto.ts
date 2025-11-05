import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTeacherDto {
  @ApiPropertyOptional({ description: 'Teacher gender', example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Teacher first name', example: 'Robert' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Teacher last name', example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiPropertyOptional({ description: 'Birth date in ISO format', example: '1985-11-04' })
  @IsOptional()
  @IsDateString()
  birthday?: string; // ISO date (YYYY-MM-DD)

  @ApiProperty({ description: 'Contact email', example: 'robert.smith@school.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Direct phone number', example: '+1-555-0200' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Street address', example: '742 Evergreen Terrace' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City of residence', example: 'Springfield' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Country of residence', example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Nationality', example: 'American' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Uploaded profile picture path', example: '/uploads/teachers/1700000000000_portrait.png' })
  @IsOptional()
  picture?: string;

  @ApiPropertyOptional({ description: 'Status indicator (-2 to 2)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;

  @ApiPropertyOptional({ description: 'Company identifier', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Assigned classroom identifier', example: 16 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  class_room_id?: number;
}

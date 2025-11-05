import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @ApiPropertyOptional({ description: 'Student gender', example: 'female' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Student first name', example: 'Emma' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Student last name', example: 'Lopez' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiPropertyOptional({ description: 'Date of birth (ISO)', example: '2010-09-03' })
  @IsOptional()
  @IsDateString()
  birthday?: string; // ISO date (YYYY-MM-DD)

  @ApiProperty({ description: 'Guardian contact email', example: 'emma.lopez@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Primary phone number', example: '+1-555-0300' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Home address', example: '221B Baker Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City of residence', example: 'London' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Country of residence', example: 'United Kingdom' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Nationality of the student', example: 'British' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Stored profile picture path', example: '/uploads/students/1700000000000_avatar.png' })
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

  @ApiPropertyOptional({ description: 'Classroom identifier', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  class_room_id?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl, IsInt, Min, Max } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Display name of the company', example: 'Acme Schools' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Public logo URL for the company', example: 'https://cdn.example.com/logos/acme.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: 'Primary contact email address', example: 'contact@acmeschools.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Support phone number', example: '+1-444-555-1212' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Public facing website', example: 'https://acmeschools.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Workflow status indicator', example: 1, minimum: -2, maximum: 2 })
  @IsOptional()
  @IsInt()
  @Min(-2)
  @Max(2)
  status?: number; // mapped to column 'statut' if present in entity
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: 'Unique username used for login', example: 'jane.doe' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Secure password chosen by the user', example: '********' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'User email address', example: 'jane.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Role assigned to the user', enum: ['user', 'admin'], example: 'admin' })
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';

  @ApiPropertyOptional({ description: 'Company identifier the user belongs to', example: 8 })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Account status indicator', example: 1, minimum: -2, maximum: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;
}

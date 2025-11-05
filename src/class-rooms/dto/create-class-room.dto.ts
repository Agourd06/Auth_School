import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateClassRoomDto {
  @ApiProperty({ description: 'Unique code used to identify the classroom', example: 'CR-101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Display title of the classroom', example: 'Physics Lab' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Maximum number of students allowed', example: 30, minimum: 0 })
  @IsInt()
  @Min(0)
  capacity: number;

  @ApiPropertyOptional({ description: 'Owning company identifier', example: 4 })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Status indicator (-2 to 2)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;
}

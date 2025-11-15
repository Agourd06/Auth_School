import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgramDto {
  @ApiProperty({ description: 'Program title shown to users', example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Rich description of the program', example: 'Undergraduate program covering algorithms, systems and AI.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Owning company identifier (automatically set from authenticated user)', example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Status flag (1 = active)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number = 1;
}

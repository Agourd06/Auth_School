import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ description: 'Module title', example: 'Mathematics Module 1' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Optional module description', example: 'Foundational module covering algebra and calculus.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Total number of hours', example: 32 })
  @IsOptional()
  @IsNumber()
  volume?: number;

  @ApiPropertyOptional({ description: 'Module coefficient/weight', example: 1 })
  @IsOptional()
  @IsNumber()
  coefficient?: number;

  @ApiPropertyOptional({ description: 'Status flag (-2 to 2)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;

  @ApiPropertyOptional({ description: 'Company identifier responsible for the module', example: 4 })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Course identifiers linked to the module', example: [1, 2, 5] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  course_ids?: number[];
}

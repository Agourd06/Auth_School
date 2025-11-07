import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateModuleCourseDto {
  @ApiProperty({ description: 'Module identifier', example: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  module_id: number;

  @ApiProperty({ description: 'Course identifier', example: 16 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  course_id: number;

  @ApiPropertyOptional({ description: 'Ordering index (tri)', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  tri?: number;
}


import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class StudentPresenceQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by student identifier', example: 45 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_id?: number;

  @ApiPropertyOptional({ description: 'Filter by student planning identifier', example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_planning_id?: number;
}


import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentsPlanningQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by status', example: 'planned' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by class identifier', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  class_id?: number;

  @ApiPropertyOptional({ description: 'Filter by classroom identifier', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  class_room_id?: number;

  @ApiPropertyOptional({ description: 'Filter by teacher identifier', example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teacher_id?: number;

  @ApiPropertyOptional({ description: 'Filter by specialization identifier', example: 9 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  specialization_id?: number;

  @ApiPropertyOptional({ description: 'Filter by planning session type identifier', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  planning_session_type_id?: number;

  @ApiPropertyOptional({ description: 'Sort order for date and time', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}


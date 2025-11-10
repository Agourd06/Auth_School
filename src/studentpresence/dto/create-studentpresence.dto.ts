import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

export class CreateStudentPresenceDto {
  @ApiProperty({ description: 'Related student planning identifier', example: 12 })
  @Type(() => Number)
  @IsNumber()
  student_planning_id: number;

  @ApiProperty({ description: 'Student identifier', example: 45 })
  @Type(() => Number)
  @IsNumber()
  student_id: number;

  @ApiPropertyOptional({ description: 'Presence status', enum: ['present', 'absent', 'late', 'excused'], default: 'absent' })
  @IsOptional()
  @IsString()
  @IsIn(['present', 'absent', 'late', 'excused'])
  presence?: string;

  @ApiPropertyOptional({ description: 'Grade or note associated with the presence', example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-1)
  @Max(20)
  note?: number;

  @ApiPropertyOptional({ description: 'Remarks about the student attendance', example: 'Arrived 10 minutes late' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Owning company identifier', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Record status', enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;
}

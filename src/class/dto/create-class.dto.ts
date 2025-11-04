import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  program_id: number;

  @Type(() => Number)
  @IsNumber()
  specialization_id: number;

  @Type(() => Number)
  @IsNumber()
  level_id: number;

  @Type(() => Number)
  @IsNumber()
  school_year_id: number;

  @Type(() => Number)
  @IsNumber()
  school_year_period_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;
}

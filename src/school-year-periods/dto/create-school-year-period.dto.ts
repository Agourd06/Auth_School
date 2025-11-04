import { IsString, IsOptional, IsDateString, IsInt, IsPositive, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSchoolYearPeriodDto {
  @IsString()
  title: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsInt()
  @IsPositive()
  schoolYearId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;
}

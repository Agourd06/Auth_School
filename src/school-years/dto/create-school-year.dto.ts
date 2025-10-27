import { Type } from 'class-transformer';
import { IsString, IsDateString, IsEnum, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';

export class CreateSchoolYearDto {
  @IsString()
  title: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

@IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;
  @IsInt()
  companyId: number;
}

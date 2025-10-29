import { IsString, IsOptional, IsDateString, IsInt, IsPositive } from 'class-validator';

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
}

import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsNumber()
  confusion?: number;

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;

  @IsOptional()
  @IsNumber()
  company_id?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  module_ids?: number[];
}

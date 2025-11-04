import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentLinkTypeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-2)
  @Max(2)
  status?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;
}

export class CreateStudentlinktypeDto {}

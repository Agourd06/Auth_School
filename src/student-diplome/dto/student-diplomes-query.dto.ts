import { PaginationDto } from '../../common/dto/pagination.dto';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentDiplomesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string; // title, school, diplome, city, country

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  student_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  annee?: number;

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



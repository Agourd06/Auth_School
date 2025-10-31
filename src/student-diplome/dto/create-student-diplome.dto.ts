import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDiplomeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  school: string;

  @IsOptional()
  @IsString()
  diplome?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  annee?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  diplome_picture_1?: string;

  @IsOptional()
  diplome_picture_2?: string;

  @Type(() => Number)
  @IsNumber()
  student_id: number;
}

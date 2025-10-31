import { PaginationDto } from '../../common/dto/pagination.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AdministratorsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string; // first_name, last_name, email

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  class_room_id?: number;
}




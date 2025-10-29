import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ClassRoomQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string; // matches code or title

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;
}



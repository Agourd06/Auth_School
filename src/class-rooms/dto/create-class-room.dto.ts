import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateClassRoomDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  capacity: number;

  @IsOptional()
  @IsNumber()
  company_id?: number;
}

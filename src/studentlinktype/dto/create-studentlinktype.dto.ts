import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentLinkTypeDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class CreateStudentlinktypeDto {}

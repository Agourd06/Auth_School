import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StudentContactService } from './student-contact.service';
import { CreateStudentContactDto } from './dto/create-student-contact.dto';
import { UpdateStudentContactDto } from './dto/update-student-contact.dto';
import { StudentContactQueryDto } from './dto/student-contact-query.dto';

@Controller('student-contact')
export class StudentContactController {
  constructor(private readonly studentContactService: StudentContactService) {}

  @Post()
  create(@Body() createStudentContactDto: CreateStudentContactDto) {
    return this.studentContactService.create(createStudentContactDto);
  }

  @Get()
  findAll(@Query() query: StudentContactQueryDto) {
    return this.studentContactService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentContactService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentContactDto: UpdateStudentContactDto) {
    return this.studentContactService.update(+id, updateStudentContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentContactService.remove(+id);
  }
}

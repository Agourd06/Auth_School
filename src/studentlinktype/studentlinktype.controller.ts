import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentlinktypeService } from './studentlinktype.service';
import { CreateStudentlinktypeDto } from './dto/create-studentlinktype.dto';
import { UpdateStudentlinktypeDto } from './dto/update-studentlinktype.dto';

@Controller('studentlinktype')
export class StudentlinktypeController {
  constructor(private readonly studentlinktypeService: StudentlinktypeService) {}

  @Post()
  create(@Body() createStudentlinktypeDto: CreateStudentlinktypeDto) {
    return this.studentlinktypeService.create(createStudentlinktypeDto);
  }

  @Get()
  findAll() {
    return this.studentlinktypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentlinktypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentlinktypeDto: UpdateStudentlinktypeDto) {
    return this.studentlinktypeService.update(+id, updateStudentlinktypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentlinktypeService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StudentlinktypeService } from './studentlinktype.service';
import { CreateStudentLinkTypeDto } from './dto/create-studentlinktype.dto';
import { UpdateStudentLinkTypeDto } from './dto/update-studentlinktype.dto';
import { StudentLinkTypeQueryDto } from './dto/studentlinktype-query.dto';

@Controller('studentlinktype')
export class StudentlinktypeController {
  constructor(private readonly studentlinktypeService: StudentlinktypeService) {}

  @Post()
  create(@Body() createStudentlinktypeDto: CreateStudentLinkTypeDto) {
    return this.studentlinktypeService.create(createStudentlinktypeDto);
  }

  @Get()
  findAll(@Query() query: StudentLinkTypeQueryDto) {
    return this.studentlinktypeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentlinktypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentlinktypeDto: UpdateStudentLinkTypeDto) {
    return this.studentlinktypeService.update(+id, updateStudentlinktypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentlinktypeService.remove(+id);
  }
}

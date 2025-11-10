import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { StudentPresenceService } from './studentpresence.service';
import { CreateStudentPresenceDto } from './dto/create-studentpresence.dto';
import { UpdateStudentPresenceDto } from './dto/update-studentpresence.dto';
import { StudentPresenceQueryDto } from './dto/studentpresence-query.dto';

@Controller('student-presence')
export class StudentPresenceController {
  constructor(private readonly studentPresenceService: StudentPresenceService) {}

  @Post()
  create(@Body() dto: CreateStudentPresenceDto) {
    return this.studentPresenceService.create(dto);
  }

  @Get()
  findAll(@Query() query: StudentPresenceQueryDto) {
    return this.studentPresenceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentPresenceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentPresenceDto) {
    return this.studentPresenceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentPresenceService.remove(id);
  }
}

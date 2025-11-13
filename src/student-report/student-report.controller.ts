import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { StudentReportService } from './student-report.service';
import { CreateStudentReportDto } from './dto/create-student-report.dto';
import { UpdateStudentReportDto } from './dto/update-student-report.dto';
import { StudentReportQueryDto } from './dto/student-report-query.dto';

@Controller('student-reports')
export class StudentReportController {
  constructor(private readonly studentReportService: StudentReportService) {}

  @Post()
  create(@Body() dto: CreateStudentReportDto) {
    return this.studentReportService.create(dto);
  }

  @Get()
  findAll(@Query() query: StudentReportQueryDto) {
    return this.studentReportService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentReportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentReportDto) {
    return this.studentReportService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentReportService.remove(id);
  }
}

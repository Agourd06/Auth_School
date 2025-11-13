import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { StudentReportDetailService } from './student-report-detail.service';
import { CreateStudentReportDetailDto } from './dto/create-student-report-detail.dto';
import { UpdateStudentReportDetailDto } from './dto/update-student-report-detail.dto';
import { StudentReportDetailQueryDto } from './dto/student-report-detail-query.dto';

@Controller('student-report-details')
export class StudentReportDetailController {
  constructor(private readonly studentReportDetailService: StudentReportDetailService) {}

  @Post()
  create(@Body() dto: CreateStudentReportDetailDto) {
    return this.studentReportDetailService.create(dto);
  }

  @Get()
  findAll(@Query() query: StudentReportDetailQueryDto) {
    return this.studentReportDetailService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentReportDetailService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentReportDetailDto) {
    return this.studentReportDetailService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentReportDetailService.remove(id);
  }
}

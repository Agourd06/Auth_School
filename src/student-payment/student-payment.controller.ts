import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { StudentPaymentService } from './student-payment.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { UpdateStudentPaymentDto } from './dto/update-student-payment.dto';
import { StudentPaymentQueryDto } from './dto/student-payment-query.dto';

@Controller('student-payments')
export class StudentPaymentController {
  constructor(private readonly studentPaymentService: StudentPaymentService) {}

  @Post()
  create(@Body() dto: CreateStudentPaymentDto) {
    return this.studentPaymentService.create(dto);
  }

  @Get()
  findAll(@Query() query: StudentPaymentQueryDto) {
    return this.studentPaymentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentPaymentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentPaymentDto) {
    return this.studentPaymentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentPaymentService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SchoolYearPeriodsService } from './school-year-periods.service';
import { CreateSchoolYearPeriodDto } from './dto/create-school-year-period.dto';
import { UpdateSchoolYearPeriodDto } from './dto/update-school-year-period.dto';
import { SchoolYearPeriodQueryDto } from './dto/school-year-period-query.dto';

@Controller('school-year-periods')
export class SchoolYearPeriodsController {
  constructor(private readonly service: SchoolYearPeriodsService) {}

  @Post()
  create(@Body() dto: CreateSchoolYearPeriodDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: SchoolYearPeriodQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolYearPeriodDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}

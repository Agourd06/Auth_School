import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchoolYearPeriodsService } from './school-year-periods.service';
import { CreateSchoolYearPeriodDto } from './dto/create-school-year-period.dto';
import { UpdateSchoolYearPeriodDto } from './dto/update-school-year-period.dto';
import { SchoolYearPeriodQueryDto } from './dto/school-year-period-query.dto';

@ApiTags('School Year Periods')
@ApiBearerAuth()
@Controller('school-year-periods')
export class SchoolYearPeriodsController {
  constructor(private readonly service: SchoolYearPeriodsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'School year period created successfully.' })
  create(@Body() dto: CreateSchoolYearPeriodDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve school year periods with pagination metadata.' })
  findAll(@Query() query: SchoolYearPeriodQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a school year period by identifier.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a school year period.' })
  update(@Param('id') id: string, @Body() dto: UpdateSchoolYearPeriodDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a school year period.' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}

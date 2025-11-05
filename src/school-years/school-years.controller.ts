import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchoolYearsService } from './school-years.service';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { SchoolYearQueryDto } from './dto/school-year-query.dto';

@ApiTags('School Years')
@ApiBearerAuth()
@Controller('school-years')
export class SchoolYearsController {
  constructor(private readonly service: SchoolYearsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'School year created successfully.' })
  create(@Body() dto: CreateSchoolYearDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve school years with pagination metadata.' })
  findAll(@Query() query: SchoolYearQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a school year by identifier.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a school year.' })
  update(@Param('id') id: string, @Body() dto: UpdateSchoolYearDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a school year.' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}

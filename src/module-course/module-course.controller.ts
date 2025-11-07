import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ModuleCourseService } from './module-course.service';
import { CreateModuleCourseDto } from './dto/create-module-course.dto';
import { UpdateModuleCourseDto } from './dto/update-module-course.dto';
import { ModuleCourseQueryDto } from './dto/module-course-query.dto';

@ApiTags('Module Course')
@ApiBearerAuth()
@Controller('module-course')
export class ModuleCourseController {
  constructor(private readonly moduleCourseService: ModuleCourseService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Module linked to course successfully.' })
  create(@Body() createModuleCourseDto: CreateModuleCourseDto) {
    return this.moduleCourseService.create(createModuleCourseDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List module-course relations with pagination.' })
  findAll(@Query() query: ModuleCourseQueryDto) {
    return this.moduleCourseService.findAll(query);
  }

  @Get(':module_id/:course_id')
  @ApiResponse({ status: 200, description: 'Fetch specific module-course relation.' })
  findOne(
    @Param('module_id', ParseIntPipe) moduleId: number,
    @Param('course_id', ParseIntPipe) courseId: number,
  ) {
    return this.moduleCourseService.findOne(moduleId, courseId);
  }

  @Patch(':module_id/:course_id')
  @ApiResponse({ status: 200, description: 'Update module-course relation.' })
  update(
    @Param('module_id', ParseIntPipe) moduleId: number,
    @Param('course_id', ParseIntPipe) courseId: number,
    @Body() updateModuleCourseDto: UpdateModuleCourseDto,
  ) {
    return this.moduleCourseService.update(moduleId, courseId, updateModuleCourseDto);
  }

  @Delete(':module_id/:course_id')
  @ApiResponse({ status: 200, description: 'Remove module-course relation.' })
  remove(
    @Param('module_id', ParseIntPipe) moduleId: number,
    @Param('course_id', ParseIntPipe) courseId: number,
  ) {
    return this.moduleCourseService.remove(moduleId, courseId);
  }
}


import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { ModuleAssignmentDto } from './dto/module-assignment.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll(@Query() queryDto: CourseQueryDto) {
    return this.courseService.findAllWithPagination(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }

  /**
   * Get modules assigned and unassigned to a course for drag-and-drop interface
   */
  @Get(':id/modules')
  getCourseModules(@Param('id') id: string) {
    return this.courseService.getCourseModules(+id);
  }

  /**
   * Batch assign/unassign modules to/from a course
   */
  @Post(':id/modules')
  batchManageCourseModules(
    @Param('id') id: string,
    @Body() assignmentDto: ModuleAssignmentDto,
  ) {
    return this.courseService.batchManageCourseModules(+id, assignmentDto);
  }

  /**
   * Add a single module to a course
   */
  @Post(':id/modules/:moduleId')
  addModuleToCourse(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.courseService.addModuleToCourse(+id, +moduleId);
  }

  /**
   * Remove a single module from a course
   */
  @Delete(':id/modules/:moduleId')
  removeModuleFromCourse(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.courseService.removeModuleFromCourse(+id, +moduleId);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { ModuleAssignmentDto } from './dto/module-assignment.dto';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Course created successfully.' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve courses with pagination metadata.' })
  findAll(@Query() queryDto: CourseQueryDto) {
    return this.courseService.findAllWithPagination(queryDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a course by identifier.' })
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a course.' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a course.' })
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }

  /**
   * Get modules assigned and unassigned to a course for drag-and-drop interface
   */
  @Get(':id/modules')
  @ApiResponse({ status: 200, description: 'Retrieve assigned and unassigned modules for a course.' })
  getCourseModules(@Param('id') id: string) {
    return this.courseService.getCourseModules(+id);
  }

  /**
   * Batch assign/unassign modules to/from a course
   */
  @Post(':id/modules')
  @ApiResponse({ status: 200, description: 'Batch assign or unassign modules for a course.' })
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
  @ApiResponse({ status: 200, description: 'Assign a single module to a course.' })
  addModuleToCourse(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.courseService.addModuleToCourse(+id, +moduleId);
  }

  /**
   * Remove a single module from a course
   */
  @Delete(':id/modules/:moduleId')
  @ApiResponse({ status: 200, description: 'Remove a module from a course.' })
  removeModuleFromCourse(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.courseService.removeModuleFromCourse(+id, +moduleId);
  }
}

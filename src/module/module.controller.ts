import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import { CourseAssignmentDto } from './dto/course-assignment.dto';

@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get()
  findAll(@Query() queryDto: ModuleQueryDto) {
    return this.moduleService.findAllWithPagination(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(+id, updateModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }

  /**
   * Get courses assigned and unassigned to a module for drag-and-drop interface
   */
  @Get(':id/courses')
  getModuleCourses(@Param('id') id: string) {
    return this.moduleService.getModuleCourses(+id);
  }

  /**
   * Batch assign/unassign courses to/from a module
   */
  @Post(':id/courses')
  batchManageModuleCourses(
    @Param('id') id: string,
    @Body() assignmentDto: CourseAssignmentDto,
  ) {
    return this.moduleService.batchManageModuleCourses(+id, assignmentDto);
  }

  /**
   * Add a single course to a module
   */
  @Post(':id/courses/:courseId')
  addCourseToModule(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.moduleService.addCourseToModule(+id, +courseId);
  }

  /**
   * Remove a single course from a module
   */
  @Delete(':id/courses/:courseId')
  removeCourseFromModule(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.moduleService.removeCourseFromModule(+id, +courseId);
  }
}

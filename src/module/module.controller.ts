import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import { CourseAssignmentDto } from './dto/course-assignment.dto';

@ApiTags('Modules')
@ApiBearerAuth()
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Module created successfully.' })
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve modules with pagination metadata.' })
  findAll(@Query() queryDto: ModuleQueryDto) {
    return this.moduleService.findAllWithPagination(queryDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a module by identifier.' })
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a module.' })
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(+id, updateModuleDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a module.' })
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }

  @Get(':id/courses')
  @ApiResponse({ status: 200, description: 'Retrieve assigned and unassigned courses for a module.' })
  getModuleCourses(@Param('id') id: string) {
    return this.moduleService.getModuleCourses(+id);
  }

  @Post(':id/courses')
  @ApiResponse({ status: 200, description: 'Batch assign or unassign courses for a module.' })
  batchManageModuleCourses(
    @Param('id') id: string,
    @Body() assignmentDto: CourseAssignmentDto,
  ) {
    return this.moduleService.batchManageModuleCourses(+id, assignmentDto);
  }

  @Post(':id/courses/:courseId')
  @ApiResponse({ status: 200, description: 'Attach a single course to a module.' })
  addCourseToModule(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.moduleService.addCourseToModule(+id, +courseId);
  }

  @Delete(':id/courses/:courseId')
  @ApiResponse({ status: 200, description: 'Detach a course from a module.' })
  removeCourseFromModule(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.moduleService.removeCourseFromModule(+id, +courseId);
  }
}

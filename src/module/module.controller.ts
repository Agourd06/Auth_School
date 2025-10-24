import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';

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

  @Post(':id/courses/:courseId')
  addCourseToModule(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.moduleService.addCourseToModule(+id, +courseId);
  }

  @Delete(':id/courses/:courseId')
  removeCourseFromModule(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.moduleService.removeCourseFromModule(+id, +courseId);
  }
}

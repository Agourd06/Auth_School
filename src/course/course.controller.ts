import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
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

  @Post(':id/modules/:moduleId')
  addModuleToCourse(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.courseService.addModuleToCourse(+id, +moduleId);
  }

  @Delete(':id/modules/:moduleId')
  removeModuleFromCourse(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.courseService.removeModuleFromCourse(+id, +moduleId);
  }
}

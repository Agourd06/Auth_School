import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassStudentService } from './class-student.service';
import { CreateClassStudentDto } from './dto/create-class-student.dto';
import { UpdateClassStudentDto } from './dto/update-class-student.dto';
import { ClassStudentQueryDto } from './dto/class-student-query.dto';

@ApiTags('Class Students')
@ApiBearerAuth()
@Controller('class-student')
export class ClassStudentController {
  constructor(private readonly classStudentService: ClassStudentService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Assign student to class successfully.' })
  create(@Body() createClassStudentDto: CreateClassStudentDto) {
    return this.classStudentService.create(createClassStudentDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve class student assignments with pagination.' })
  findAll(@Query() query: ClassStudentQueryDto) {
    return this.classStudentService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a class student assignment by identifier.' })
  findOne(@Param('id') id: string) {
    return this.classStudentService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a class student assignment.' })
  update(@Param('id') id: string, @Body() updateClassStudentDto: UpdateClassStudentDto) {
    return this.classStudentService.update(+id, updateClassStudentDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a class student assignment.' })
  remove(@Param('id') id: string) {
    return this.classStudentService.remove(+id);
  }
}

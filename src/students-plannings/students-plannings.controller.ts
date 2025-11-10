import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentsPlanningsService } from './students-plannings.service';
import { CreateStudentsPlanningDto } from './dto/create-students-planning.dto';
import { UpdateStudentsPlanningDto } from './dto/update-students-planning.dto';
import { StudentsPlanningQueryDto } from './dto/students-planning-query.dto';

@ApiTags('Planning Students')
@ApiBearerAuth()
@Controller('students-plannings')
export class StudentsPlanningsController {
  constructor(private readonly studentsPlanningsService: StudentsPlanningsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Planning entry created successfully.' })
  create(@Body() createStudentsPlanningDto: CreateStudentsPlanningDto) {
    return this.studentsPlanningsService.create(createStudentsPlanningDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve planning entries with pagination metadata.' })
  findAll(@Query() query: StudentsPlanningQueryDto) {
    return this.studentsPlanningsService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve planning entry by identifier.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsPlanningsService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update planning entry.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStudentsPlanningDto: UpdateStudentsPlanningDto) {
    return this.studentsPlanningsService.update(id, updateStudentsPlanningDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Delete planning entry.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsPlanningsService.remove(id);
  }
}

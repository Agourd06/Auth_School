import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentContactService } from './student-contact.service';
import { CreateStudentContactDto } from './dto/create-student-contact.dto';
import { UpdateStudentContactDto } from './dto/update-student-contact.dto';
import { StudentContactQueryDto } from './dto/student-contact-query.dto';

@ApiTags('Student Contacts')
@ApiBearerAuth()
@Controller('student-contact')
export class StudentContactController {
  constructor(private readonly studentContactService: StudentContactService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Student contact created successfully.' })
  create(@Body() dto: CreateStudentContactDto) {
    return this.studentContactService.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve student contacts with pagination metadata.' })
  findAll(@Query() query: StudentContactQueryDto) {
    return this.studentContactService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a student contact by identifier.' })
  findOne(@Param('id') id: string) {
    return this.studentContactService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a student contact.' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentContactDto) {
    return this.studentContactService.update(+id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a student contact.' })
  remove(@Param('id') id: string) {
    return this.studentContactService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentContactService } from './student-contact.service';
import { CreateStudentContactDto } from './dto/create-student-contact.dto';
import { UpdateStudentContactDto } from './dto/update-student-contact.dto';
import { StudentContactQueryDto } from './dto/student-contact-query.dto';

@ApiTags('StudentContact')
@ApiBearerAuth()
@Controller('student-contact')
export class StudentContactController {
  constructor(private readonly studentContactService: StudentContactService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'StudentContact created successfully.' })
  create(@Body() createStudentContactDto: CreateStudentContactDto) {
    return this.studentContactService.create(createStudentContactDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve student contacts with pagination metadata.' })
  findAll(@Query() queryDto: StudentContactQueryDto) {
    return this.studentContactService.findAll(queryDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a student contact by identifier.' })
  findOne(@Param('id') id: string) {
    return this.studentContactService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a student contact.' })
  update(@Param('id') id: string, @Body() updateStudentContactDto: UpdateStudentContactDto) {
    return this.studentContactService.update(+id, updateStudentContactDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Soft delete a student contact (sets status to -2).' })
  remove(@Param('id') id: string) {
    return this.studentContactService.remove(+id);
  }
}

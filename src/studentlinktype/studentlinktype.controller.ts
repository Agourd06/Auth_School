import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentlinktypeService } from './studentlinktype.service';
import { CreateStudentLinkTypeDto } from './dto/create-studentlinktype.dto';
import { UpdateStudentLinkTypeDto } from './dto/update-studentlinktype.dto';
import { StudentLinkTypeQueryDto } from './dto/studentlinktype-query.dto';

@ApiTags('Student Link Types')
@ApiBearerAuth()
@Controller('studentlinktype')
export class StudentlinktypeController {
  constructor(private readonly studentlinktypeService: StudentlinktypeService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Student link type created successfully.' })
  create(@Body() dto: CreateStudentLinkTypeDto) {
    return this.studentlinktypeService.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve link types with pagination metadata.' })
  findAll(@Query() query: StudentLinkTypeQueryDto) {
    return this.studentlinktypeService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a link type by identifier.' })
  findOne(@Param('id') id: string) {
    return this.studentlinktypeService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a link type.' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentLinkTypeDto) {
    return this.studentlinktypeService.update(+id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a link type.' })
  remove(@Param('id') id: string) {
    return this.studentlinktypeService.remove(+id);
  }
}

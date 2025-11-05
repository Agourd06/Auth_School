import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassQueryDto } from './dto/class-query.dto';

@ApiTags('Classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Class created successfully.' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve classes with pagination metadata.' })
  findAll(@Query() query: ClassQueryDto) {
    return this.classService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a class by identifier.' })
  findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a class.' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(+id, updateClassDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a class.' })
  remove(@Param('id') id: string) {
    return this.classService.remove(+id);
  }
}

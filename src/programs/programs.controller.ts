import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramQueryDto } from './dto/program-query.dto';
import { ProgramService } from './programs.service';

@ApiTags('Programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramController {
  constructor(private readonly service: ProgramService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Program created successfully.' })
  create(@Body() dto: CreateProgramDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve programs with pagination metadata.' })
  findAll(@Query() query: ProgramQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a program by identifier.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a program.' })
  update(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a program.' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}

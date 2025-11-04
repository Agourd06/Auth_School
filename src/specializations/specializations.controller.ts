import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { SpecializationQueryDto } from './dto/specialization-query.dto';

@Controller('specializations')
export class SpecializationsController {
  constructor(private readonly specializationsService: SpecializationsService) {}

  @Post()
  create(@Body() createSpecializationDto: CreateSpecializationDto) {
    return this.specializationsService.create(createSpecializationDto);
  }

  @Get()
  findAll(@Query() query: SpecializationQueryDto) {
    return this.specializationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specializationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpecializationDto: UpdateSpecializationDto) {
    return this.specializationsService.update(+id, updateSpecializationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specializationsService.remove(+id);
  }
}

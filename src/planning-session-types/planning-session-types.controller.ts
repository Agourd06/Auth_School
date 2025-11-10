import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PlanningSessionTypesService } from './planning-session-types.service';
import { CreatePlanningSessionTypeDto } from './dto/create-planning-session-type.dto';
import { UpdatePlanningSessionTypeDto } from './dto/update-planning-session-type.dto';
import { PlanningSessionTypesQueryDto } from './dto/planning-session-types-query.dto';

@Controller('planning-session-types')
export class PlanningSessionTypesController {
  constructor(private readonly planningSessionTypesService: PlanningSessionTypesService) {}

  @Post()
  create(@Body() createPlanningSessionTypeDto: CreatePlanningSessionTypeDto) {
    return this.planningSessionTypesService.create(createPlanningSessionTypeDto);
  }

  @Get()
  findAll(@Query() query: PlanningSessionTypesQueryDto) {
    return this.planningSessionTypesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planningSessionTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanningSessionTypeDto: UpdatePlanningSessionTypeDto) {
    return this.planningSessionTypesService.update(+id, updatePlanningSessionTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planningSessionTypesService.remove(+id);
  }
}

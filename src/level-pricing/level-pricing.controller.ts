import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { LevelPricingService } from './level-pricing.service';
import { CreateLevelPricingDto } from './dto/create-level-pricing.dto';
import { UpdateLevelPricingDto } from './dto/update-level-pricing.dto';
import { LevelPricingQueryDto } from './dto/level-pricing-query.dto';

@Controller('level-pricings')
export class LevelPricingController {
  constructor(private readonly levelPricingService: LevelPricingService) {}

  @Post()
  create(@Body() dto: CreateLevelPricingDto) {
    return this.levelPricingService.create(dto);
  }

  @Get()
  findAll(@Query() query: LevelPricingQueryDto) {
    return this.levelPricingService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.levelPricingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLevelPricingDto) {
    return this.levelPricingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.levelPricingService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClassRoomsService } from './class-rooms.service';
import { CreateClassRoomDto } from './dto/create-class-room.dto';
import { UpdateClassRoomDto } from './dto/update-class-room.dto';
import { ClassRoomQueryDto } from './dto/class-room-query.dto';

@Controller('class-rooms')
export class ClassRoomsController {
  constructor(private readonly classRoomsService: ClassRoomsService) {}

  @Post()
  create(@Body() createClassRoomDto: CreateClassRoomDto) {
    return this.classRoomsService.create(createClassRoomDto);
  }

  @Get()
  findAll(@Query() query: ClassRoomQueryDto) {
    return this.classRoomsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classRoomsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassRoomDto: UpdateClassRoomDto) {
    return this.classRoomsService.update(+id, updateClassRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classRoomsService.remove(+id);
  }
}

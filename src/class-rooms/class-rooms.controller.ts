import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassRoomsService } from './class-rooms.service';
import { CreateClassRoomDto } from './dto/create-class-room.dto';
import { UpdateClassRoomDto } from './dto/update-class-room.dto';
import { ClassRoomQueryDto } from './dto/class-room-query.dto';

@ApiTags('Class Rooms')
@ApiBearerAuth()
@Controller('class-rooms')
export class ClassRoomsController {
  constructor(private readonly classRoomsService: ClassRoomsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Class room created successfully.' })
  create(@Body() createClassRoomDto: CreateClassRoomDto) {
    return this.classRoomsService.create(createClassRoomDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve class rooms with pagination metadata.' })
  findAll(@Query() query: ClassRoomQueryDto) {
    return this.classRoomsService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a class room by identifier.' })
  findOne(@Param('id') id: string) {
    return this.classRoomsService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a class room record.' })
  update(@Param('id') id: string, @Body() updateClassRoomDto: UpdateClassRoomDto) {
    return this.classRoomsService.update(+id, updateClassRoomDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a class room record.' })
  remove(@Param('id') id: string) {
    return this.classRoomsService.remove(+id);
  }
}

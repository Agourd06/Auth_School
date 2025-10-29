import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRoomsService } from './class-rooms.service';
import { ClassRoomsController } from './class-rooms.controller';
import { ClassRoom } from './entities/class-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassRoom])],
  controllers: [ClassRoomsController],
  providers: [ClassRoomsService],
  exports: [ClassRoomsService],
})
export class ClassRoomsModule {}

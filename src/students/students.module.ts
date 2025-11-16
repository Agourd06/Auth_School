import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { ClassRoom } from '../class-rooms/entities/class-room.entity';
import { StudentDiplome } from '../student-diplome/entities/student-diplome.entity';
import { StudentContact } from '../student-contact/entities/student-contact.entity';
import { StudentLinkType } from '../studentlinktype/entities/studentlinktype.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, ClassRoom, StudentDiplome, StudentContact, StudentLinkType])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}

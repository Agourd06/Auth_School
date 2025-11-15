import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentPresenceService } from './studentpresence.service';
import { StudentPresenceController } from './studentpresence.controller';
import { StudentPresence } from './entities/studentpresence.entity';
import { Student } from '../students/entities/student.entity';
import { StudentsPlanning } from '../students-plannings/entities/students-planning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentPresence, Student, StudentsPlanning])],
  controllers: [StudentPresenceController],
  providers: [StudentPresenceService],
  exports: [StudentPresenceService],
})
export class StudentPresenceModule {}

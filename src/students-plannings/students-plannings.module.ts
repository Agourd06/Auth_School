import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsPlanningsService } from './students-plannings.service';
import { StudentsPlanningsController } from './students-plannings.controller';
import { StudentsPlanning } from './entities/students-planning.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Specialization } from '../specializations/entities/specialization.entity';
import { ClassEntity } from '../class/entities/class.entity';
import { ClassRoom } from '../class-rooms/entities/class-room.entity';
import { PlanningSessionType } from '../planning-session-types/entities/planning-session-type.entity';
import { SchoolYear } from '../school-years/entities/school-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentsPlanning, Teacher, Specialization, ClassEntity, ClassRoom, PlanningSessionType, SchoolYear])],
  controllers: [StudentsPlanningsController],
  providers: [StudentsPlanningsService],
  exports: [StudentsPlanningsService],
})
export class StudentsPlanningsModule {}

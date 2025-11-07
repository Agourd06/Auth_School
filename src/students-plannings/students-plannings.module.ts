import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsPlanningsService } from './students-plannings.service';
import { StudentsPlanningsController } from './students-plannings.controller';
import { StudentsPlanning } from './entities/students-planning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentsPlanning])],
  controllers: [StudentsPlanningsController],
  providers: [StudentsPlanningsService],
  exports: [StudentsPlanningsService],
})
export class StudentsPlanningsModule {}

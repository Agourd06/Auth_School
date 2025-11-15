import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentReportService } from './student-report.service';
import { StudentReportController } from './student-report.controller';
import { StudentReport } from './entities/student-report.entity';
import { Student } from '../students/entities/student.entity';
import { SchoolYearPeriod } from '../school-year-periods/entities/school-year-period.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentReport, Student, SchoolYearPeriod])],
  controllers: [StudentReportController],
  providers: [StudentReportService],
  exports: [StudentReportService],
})
export class StudentReportModule {}

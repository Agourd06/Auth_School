import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentReportService } from './student-report.service';
import { StudentReportController } from './student-report.controller';
import { StudentReport } from './entities/student-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentReport])],
  controllers: [StudentReportController],
  providers: [StudentReportService],
  exports: [StudentReportService],
})
export class StudentReportModule {}

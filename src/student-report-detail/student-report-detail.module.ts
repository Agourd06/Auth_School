import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentReportDetailService } from './student-report-detail.service';
import { StudentReportDetailController } from './student-report-detail.controller';
import { StudentReportDetail } from './entities/student-report-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentReportDetail])],
  controllers: [StudentReportDetailController],
  providers: [StudentReportDetailService],
  exports: [StudentReportDetailService],
})
export class StudentReportDetailModule {}

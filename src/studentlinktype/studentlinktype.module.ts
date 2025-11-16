import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentlinktypeService } from './studentlinktype.service';
import { StudentlinktypeController } from './studentlinktype.controller';
import { StudentLinkType } from './entities/studentlinktype.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentLinkType, Student])],
  controllers: [StudentlinktypeController],
  providers: [StudentlinktypeService],
  exports: [StudentlinktypeService],
})
export class StudentlinktypeModule {}

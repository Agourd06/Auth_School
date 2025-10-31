import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentDiplomeService } from './student-diplome.service';
import { StudentDiplomeController } from './student-diplome.controller';
import { StudentDiplome } from './entities/student-diplome.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentDiplome])],
  controllers: [StudentDiplomeController],
  providers: [StudentDiplomeService],
  exports: [StudentDiplomeService],
})
export class StudentDiplomeModule {}

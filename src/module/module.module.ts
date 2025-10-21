import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { Module as ModuleEntity } from './entities/module.entity';
import { Course } from '../course/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity, Course])],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class ModuleModule {}

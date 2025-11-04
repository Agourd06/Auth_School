import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecializationsService } from './specializations.service';
import { SpecializationsController } from './specializations.controller';
import { Specialization } from './entities/specialization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specialization])],
  controllers: [SpecializationsController],
  providers: [SpecializationsService],
  exports: [SpecializationsService],
})
export class SpecializationsModule {}

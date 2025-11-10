import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentPresenceService } from './studentpresence.service';
import { StudentPresenceController } from './studentpresence.controller';
import { StudentPresence } from './entities/studentpresence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentPresence])],
  controllers: [StudentPresenceController],
  providers: [StudentPresenceService],
  exports: [StudentPresenceService],
})
export class StudentPresenceModule {}

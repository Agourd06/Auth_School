import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelPricingService } from './level-pricing.service';
import { LevelPricingController } from './level-pricing.controller';
import { LevelPricing } from './entities/level-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LevelPricing])],
  controllers: [LevelPricingController],
  providers: [LevelPricingService],
  exports: [LevelPricingService],
})
export class LevelPricingModule {}

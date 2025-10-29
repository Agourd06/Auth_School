import { Test, TestingModule } from '@nestjs/testing';
import { SchoolYearPeriodsController } from './school-year-periods.controller';
import { SchoolYearPeriodsService } from './school-year-periods.service';

describe('SchoolYearPeriodsController', () => {
  let controller: SchoolYearPeriodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolYearPeriodsController],
      providers: [SchoolYearPeriodsService],
    }).compile();

    controller = module.get<SchoolYearPeriodsController>(SchoolYearPeriodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

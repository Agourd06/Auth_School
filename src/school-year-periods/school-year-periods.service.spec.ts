import { Test, TestingModule } from '@nestjs/testing';
import { SchoolYearPeriodsService } from './school-year-periods.service';

describe('SchoolYearPeriodsService', () => {
  let service: SchoolYearPeriodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolYearPeriodsService],
    }).compile();

    service = module.get<SchoolYearPeriodsService>(SchoolYearPeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

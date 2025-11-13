import { Test, TestingModule } from '@nestjs/testing';
import { StudentReportService } from './student-report.service';

describe('StudentReportService', () => {
  let service: StudentReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentReportService],
    }).compile();

    service = module.get<StudentReportService>(StudentReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

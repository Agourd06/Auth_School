import { Test, TestingModule } from '@nestjs/testing';
import { StudentDiplomeService } from './student-diplome.service';

describe('StudentDiplomeService', () => {
  let service: StudentDiplomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentDiplomeService],
    }).compile();

    service = module.get<StudentDiplomeService>(StudentDiplomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

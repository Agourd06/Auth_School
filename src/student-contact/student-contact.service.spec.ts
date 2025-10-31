import { Test, TestingModule } from '@nestjs/testing';
import { StudentContactService } from './student-contact.service';

describe('StudentContactService', () => {
  let service: StudentContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentContactService],
    }).compile();

    service = module.get<StudentContactService>(StudentContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

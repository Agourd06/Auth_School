import { Test, TestingModule } from '@nestjs/testing';
import { StudentPresenceService } from './studentpresence.service';

describe('StudentPresenceService', () => {
  let service: StudentPresenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentPresenceService],
    }).compile();

    service = module.get<StudentPresenceService>(StudentPresenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

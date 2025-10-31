import { Test, TestingModule } from '@nestjs/testing';
import { StudentlinktypeService } from './studentlinktype.service';

describe('StudentlinktypeService', () => {
  let service: StudentlinktypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentlinktypeService],
    }).compile();

    service = module.get<StudentlinktypeService>(StudentlinktypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

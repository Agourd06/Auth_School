import { Test, TestingModule } from '@nestjs/testing';
import { StudentlinktypeController } from './studentlinktype.controller';
import { StudentlinktypeService } from './studentlinktype.service';

describe('StudentlinktypeController', () => {
  let controller: StudentlinktypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentlinktypeController],
      providers: [StudentlinktypeService],
    }).compile();

    controller = module.get<StudentlinktypeController>(StudentlinktypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

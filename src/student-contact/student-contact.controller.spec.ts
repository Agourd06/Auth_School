import { Test, TestingModule } from '@nestjs/testing';
import { StudentContactController } from './student-contact.controller';
import { StudentContactService } from './student-contact.service';

describe('StudentContactController', () => {
  let controller: StudentContactController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentContactController],
      providers: [StudentContactService],
    }).compile();

    controller = module.get<StudentContactController>(StudentContactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

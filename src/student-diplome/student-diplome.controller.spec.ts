import { Test, TestingModule } from '@nestjs/testing';
import { StudentDiplomeController } from './student-diplome.controller';
import { StudentDiplomeService } from './student-diplome.service';

describe('StudentDiplomeController', () => {
  let controller: StudentDiplomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentDiplomeController],
      providers: [StudentDiplomeService],
    }).compile();

    controller = module.get<StudentDiplomeController>(StudentDiplomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

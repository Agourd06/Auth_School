import { Test, TestingModule } from '@nestjs/testing';
import { ProgramController } from './programs.controller';
import { ProgramService } from './programs.service';


describe('ProgramsController', () => {
  let controller: ProgramController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramController],
      providers: [ProgramService],
    }).compile();

    controller = module.get<ProgramController>(ProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

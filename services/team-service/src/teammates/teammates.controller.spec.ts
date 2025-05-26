import { Test, TestingModule } from '@nestjs/testing';
import { TeammatesController } from './teammates.controller';
import { TeammatesService } from './teammates.service';

describe('TeammatesController', () => {
  let controller: TeammatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeammatesController],
      providers: [TeammatesService],
    }).compile();

    controller = module.get<TeammatesController>(TeammatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

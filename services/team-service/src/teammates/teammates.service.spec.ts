import { Test, TestingModule } from '@nestjs/testing';
import { TeammatesService } from './teammates.service';

describe('TeammatesService', () => {
  let service: TeammatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeammatesService],
    }).compile();

    service = module.get<TeammatesService>(TeammatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

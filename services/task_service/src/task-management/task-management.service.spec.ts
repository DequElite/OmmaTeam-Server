import { Test, TestingModule } from '@nestjs/testing';
import { TaskManagementService } from './task-management.service';

describe('TaskManagementService', () => {
  let service: TaskManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskManagementService],
    }).compile();

    service = module.get<TaskManagementService>(TaskManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

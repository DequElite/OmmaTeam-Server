import { Test, TestingModule } from '@nestjs/testing';
import { TaskManagementController } from './task-management.controller';
import { TaskManagementService } from './task-management.service';

describe('TaskManagementController', () => {
  let controller: TaskManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskManagementController],
      providers: [TaskManagementService],
    }).compile();

    controller = module.get<TaskManagementController>(TaskManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DataManagementController } from './data-management.controller';
import { DataManagementService } from './data-management.service';

describe('DataManagementController', () => {
  let controller: DataManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataManagementController],
      providers: [DataManagementService],
    }).compile();

    controller = module.get<DataManagementController>(DataManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

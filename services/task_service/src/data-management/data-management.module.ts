import { Module } from '@nestjs/common';
import { DataManagementService } from './data-management.service';
import { DataManagementController } from './data-management.controller';

@Module({
  controllers: [DataManagementController],
  providers: [DataManagementService],
})
export class DataManagementModule {}

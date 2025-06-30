import { Controller } from '@nestjs/common';
import { DataManagementService } from './data-management.service';

@Controller('data-management')
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}
}

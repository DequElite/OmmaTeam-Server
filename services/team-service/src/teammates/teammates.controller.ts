import { Controller } from '@nestjs/common';
import { TeammatesService } from './teammates.service';

@Controller('teammates')
export class TeammatesController {
  constructor(private readonly teammatesService: TeammatesService) {}
}

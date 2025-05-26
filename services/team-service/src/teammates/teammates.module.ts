import { Module } from '@nestjs/common';
import { TeammatesService } from './teammates.service';
import { TeammatesController } from './teammates.controller';

@Module({
  controllers: [TeammatesController],
  providers: [TeammatesService],
})
export class TeammatesModule {}

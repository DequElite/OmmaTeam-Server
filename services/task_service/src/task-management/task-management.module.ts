import { Module } from '@nestjs/common';
import { TaskManagementService } from './task-management.service';
import { TaskManagementController } from './task-management.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from 'omma-shared-lib/generated/prisma';

@Module({
  controllers: [TaskManagementController],
  providers: [TaskManagementService, PrismaClient],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class TaskManagementModule {}

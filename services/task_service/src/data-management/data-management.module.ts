import { Module } from '@nestjs/common';
import { DataManagementService } from './data-management.service';
import { DataManagementController } from './data-management.controller';
import { PrismaService, RedisService } from 'omma-shared-lib';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [DataManagementController],
  providers: [DataManagementService, PrismaService, RedisService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class DataManagementModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TaskManagementModule } from './task-management/task-management.module';
import { DataManagementModule } from './data-management/data-management.module';
import { SharedModule } from 'omma-shared-lib';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TaskManagementModule,
    DataManagementModule,
    SharedModule,
  ],
})
export class AppModule {}

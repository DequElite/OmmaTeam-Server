import { Module } from '@nestjs/common';
import { FeedbackModule } from './feedback/feedback.module';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from 'omma-shared-lib';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    SharedModule,
    FeedbackModule,
  ],
})
export class AppModule {}

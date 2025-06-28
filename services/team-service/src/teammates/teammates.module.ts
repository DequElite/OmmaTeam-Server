import { Module } from '@nestjs/common';
import { TeammatesService } from './teammates.service';
import { TeammatesController } from './teammates.controller';
import { MailService, PrismaService, RedisService } from 'omma-shared-lib';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [TeammatesController],
  providers: [TeammatesService, PrismaService, MailService, RedisService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class TeammatesModule {}

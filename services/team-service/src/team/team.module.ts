import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService, RedisService } from 'omma-shared-lib';

@Module({
  controllers: [TeamController],
  providers: [TeamService, PrismaService, RedisService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class TeamModule {}

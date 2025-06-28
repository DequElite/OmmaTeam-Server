import { Module } from '@nestjs/common';
import { JwtauthGuard } from './guards/jwtauth.guard';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail/mail.service';
import { RedisService } from './redis/redis.service';

@Module({
    providers: [JwtauthGuard, PrismaService, MailService, RedisService],
    exports: [JwtauthGuard, PrismaService, MailService, RedisService],
})
export class SharedModule {}

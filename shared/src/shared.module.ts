import { Module } from '@nestjs/common';
import { JwtauthGuard } from './guards/jwtauth.guard';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail/mail.service';

@Module({
    providers: [JwtauthGuard, PrismaService, MailService],
    exports: [JwtauthGuard, PrismaService, MailService],
})
export class SharedModule {}

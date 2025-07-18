import { Module } from '@nestjs/common';
import { JwtauthGuard } from './guards/Jwt/jwtauth.guard';
import { PrismaService } from './services/prisma/prisma.service';
import { MailService } from './services/mail/mail.service';
import { RedisService } from './services/redis/redis.service';
import { IsTeamLeaderGuard } from './guards/Team/is-team-leader/is-team-leader.guard';
import { TeamGuardGuard } from './guards/Team/team-guard/team-guard.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
    providers: [JwtauthGuard, PrismaService, MailService, RedisService, IsTeamLeaderGuard, TeamGuardGuard],
    exports: [JwtauthGuard, PrismaService, MailService, RedisService, IsTeamLeaderGuard, TeamGuardGuard, JwtModule],
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ]
})
export class SharedModule {}

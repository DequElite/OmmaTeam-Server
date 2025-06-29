import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { RedisService } from 'src/services/redis/redis.service';
import { CachedTeam } from '../types/team.types';

interface IRequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class TeamGuardGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  //todo: добавь кеширование данных комманд с помощью redis

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequestWithUser>();

    const user = req.user;

    const teamId = req.params?.id;

    if (!user || !teamId) {
      throw new HttpException('USER_OR_TEAM_NOT_EXIST', HttpStatus.BAD_REQUEST);
    }

    let team: CachedTeam | null = await this.redis.getTeam<CachedTeam>(teamId);

    if (!team) {
      team = await this.prisma.team.findUnique({
        where: {
          id: teamId,
        },
        include: {
          teammates: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!team) {
        throw new HttpException('TEAM_NOT_EXIST', HttpStatus.NOT_FOUND);
      }

      await this.redis.setTeam<CachedTeam>(teamId, team);
    }

    const teammateAsUser = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!teammateAsUser) {
      throw new HttpException('TEAMMATEASUSER_NOT_EXIST', HttpStatus.NOT_FOUND);
    }

    const isTeamMate =
      team.teammates?.some(
        (teammate) =>
          teammate.userId === teammateAsUser.id && teammate.isAccepted,
      ) ?? false;

    if (!isTeamMate) {
      throw new HttpException('USER_NOT_IN_TEAM', HttpStatus.FORBIDDEN);
    }

    req['team'] = team;

    return true;
  }
}

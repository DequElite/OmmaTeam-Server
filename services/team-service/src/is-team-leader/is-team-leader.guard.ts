import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService, RedisService } from 'omma-shared-lib';
import { User } from 'omma-shared-lib/generated/prisma';
import { Request } from 'express';
import { CachedTeam } from 'src/types/team.types';

interface IRequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class IsTeamLeaderGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequestWithUser>();
    const user = req.user;

    const teamId = req.params.id;

    if (!user || !teamId) {
      throw new HttpException('USER_OR_TEAM_NOT_EXIST', HttpStatus.FORBIDDEN);
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

    console.log('USER AT TEAM GUARD: ', teammateAsUser);
    if (!team) {
      throw new HttpException('TEAM_NOT_EXIST', HttpStatus.NOT_FOUND);
    }
    if (team.leaderId !== teammateAsUser.id) {
      throw new HttpException('USER_NOT_TEAM_LEADER', HttpStatus.FORBIDDEN);
    }
    req['team'] = team;

    return true;
  }
}

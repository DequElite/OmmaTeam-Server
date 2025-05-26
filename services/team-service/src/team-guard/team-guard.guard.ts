import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import { User } from 'omma-shared-lib/generated/prisma';

interface IRequestWithUser extends Request {
  user?: User;
  params?: {
    id?: any;
  };
}

@Injectable()
export class TeamGuardGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  //todo: добавь кеширование данных комманд с помощью redis

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequestWithUser>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = req.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const teamId = req.params?.id;

    if (!user || !teamId) {
      throw new HttpException('USER_OR_TEAM_NOT_EXIST', HttpStatus.FORBIDDEN);
    }

    const team = await this.prisma.team.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: teamId,
      },
      include: {
        teammates: true,
      },
    });

    if (!team) {
      throw new HttpException('TEAM_NOT_EXIST', HttpStatus.NOT_FOUND);
    }

    const isTeamMate = team.teammates.some(
      (teammate) => teammate.userId === user.id && teammate.isAccepted,
    );

    if (!isTeamMate) {
      throw new HttpException('USER_NOT_IN_TEAM', HttpStatus.FORBIDDEN);
    }

    req['team'] = team;

    return true;
  }
}

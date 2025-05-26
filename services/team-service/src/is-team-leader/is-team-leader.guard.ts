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
export class IsTeamLeaderGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequestWithUser>();
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
    if (team.leaderId !== user.id) {
      throw new HttpException('USER_NOT_TEAM_LEADER', HttpStatus.FORBIDDEN);
    }
    req['team'] = team;

    return true;
  }
}

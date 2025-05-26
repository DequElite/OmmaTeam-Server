import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService, PrismaService } from 'omma-shared-lib';
import { InviteUserDto } from './dto/Invite.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TeammatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  public async inviteByMail(dto: InviteUserDto) {
    const user = await this.checkIfUserExists(dto.email);
    if (!user) {
      throw new HttpException('USER_NOT_EXIST', HttpStatus.NOT_FOUND);
    }

    const team = await this.checkIfTeamExist(dto.teamId);
    if (!team) {
      throw new HttpException('TEAM_NOT_EXIST', HttpStatus.NOT_FOUND);
    }

    const isUserExistInTeam = await this.checkIfUserExistInTeam(
      dto.email,
      dto.teamId,
    );
    if (isUserExistInTeam) {
      throw new HttpException('USER_ALREADY_IN_TEAM', HttpStatus.BAD_REQUEST);
    }

    const { inviteToken, inviteTokenExpireAt } = this.generateInviteToken();
    await this.createTeammateAndSaveInviteToken(
      user.id,
      inviteToken,
      inviteTokenExpireAt,
      team.id,
    );

    //todo: доделать эту функцию инвайта
  }

  private generateInviteToken() {
    const inviteToken = randomUUID();
    const inviteTokenExpireAt = new Date(Date.now() + 30 * 60 * 1000);

    return {
      inviteToken,
      inviteTokenExpireAt,
    };
  }

  private async createTeammateAndSaveInviteToken(
    userId: string,
    token: string,
    tokenExpiredAt: Date,
    teamId: string,
  ) {
    await this.prisma.teammate.create({
      data: {
        userId: userId,
        inviteToken: token,
        inviteExpiresAt: tokenExpiredAt,
        isAccepted: false,
        teamId,
      },
    });
  }

  private async checkIfTeamExist(teamId: string) {
    return await this.prisma.team.findUnique({ where: { id: teamId } });
  }

  private async getUser(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  private async checkIfUserExists(email: string) {
    const user = await this.getUser(email);

    return user;
  }

  private async checkIfUserExistInTeam(email: string, teamId: string) {
    const user = await this.getUser(email);

    if (!user) {
      return false;
    }

    const teammate = await this.prisma.teammate.findFirst({
      where: {
        userId: user?.id,
        teamId: teamId,
      },
    });

    return !!teammate;
  }
}

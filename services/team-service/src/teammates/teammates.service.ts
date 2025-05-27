import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService, PrismaService } from 'omma-shared-lib';
import { AcceptInvationDto, InviteUserDto } from './dto/Invite.dto';
import { randomUUID } from 'crypto';
import inviteEmail from './inviteEmail.template';

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

    const inviteLinkDomain =
      process.env.APP_MODE === 'DEV'
        ? process.env.EMAIL_DEV_RESET_LINK
        : process.env.EMAIL_PROD_RESET_LINK;
    const inviteLink = `${inviteLinkDomain}${inviteToken}`;

    const inviteEmailTemplate = inviteEmail(inviteLink, team.name, team.name);

    try {
      await this.mail.sendMail(
        user.email,
        'Team invite link',
        inviteEmailTemplate,
      );

      return {
        message: 'An invite link has been sent',
      };
    } catch (err) {
      console.error('Error while sending invite email: ', err);

      throw new HttpException(
        'INVITE_SENDING_FAILED',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async acceptInvation(dto: AcceptInvationDto, teamId: string) {
    const teammate = await this.checkIfTeammateExistByAcceptInvation(
      dto.email,
      teamId,
    );
    if (!teammate) {
      throw new HttpException(
        'TEAMMATE_OR_USER_NOT_EXIST',
        HttpStatus.NOT_FOUND,
      );
    }

    //todo: доделай acceptInvation
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

    if (!teammate) {
      return false;
    }

    if (teammate.isAccepted) {
      return true;
    }

    const isInviteStillValid =
      teammate.inviteExpiresAt &&
      teammate.inviteExpiresAt.getTime() > Date.now();

    return isInviteStillValid;
  }

  private async checkIfTeammateExistByAcceptInvation(
    email: string,
    teamId: string,
  ) {
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

    return teammate;
  }
}

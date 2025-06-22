import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import { CreateTeamServiceDto } from './dto/createTeam.dto';
import { Team, User } from 'omma-shared-lib/generated/prisma';
import { ChangeTeamNameDto } from './dto/changeTeam.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  public async getTeamData(email: string, team: Team) {
    const user = await this.checkIfUserExists(email);

    let teamData: Team & { isLeader: boolean };

    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (user && team?.leaderId === user.id) {
      teamData = { ...team, isLeader: true };
    } else {
      teamData = { ...team, isLeader: false };
    }

    console.log(user, teamData)

    return {
      message: 'access granted',
      team: teamData,
    };
  }

  public async changeTeamName(dto: ChangeTeamNameDto) {
    const isTeamExists = await this.checkIfTeamExistsById(dto.id);
    if (!isTeamExists) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.prisma.team.update({
      where: {
        id: dto.id,
      },
      data: {
        name: dto.name,
      },
    });

    return {
      message: 'Team name changed success',
    };
  }

  public async createTeam(dto: CreateTeamServiceDto) {
    const user = await this.checkIfUserExists(dto.email);

    const isTeamExists = await this.checkIfTeamExistsByName(dto.name);
    if (isTeamExists) {
      throw new HttpException('TEAM_ALREADY_EXIST', HttpStatus.BAD_REQUEST);
    }

    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        leaderId: user.id,
      },
    });

    await this.prisma.teammate.create({
      data: {
        userId: user.id,
        teamId: team.id,
        isAccepted: true,
      },
    });

    return {
      message: 'Team created successfully',
      team,
    };
  }

  public async deleteTeam(teamId: string) {
    const isTeamExists = await this.checkIfTeamExistsById(teamId);
    if (!isTeamExists) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.prisma.teammate.deleteMany({
      where: { teamId },
    });

    await this.prisma.team.delete({
      where: { id: teamId },
    });
    return {
      message: 'Team deleted successfully',
    };
  }

  private async checkIfUserExists(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  private async checkIfTeamExistsByName(name: string): Promise<boolean> {
    return !!(await this.prisma.team.findUnique({ where: { name } }));
  }

  private async checkIfTeamExistsById(id: string): Promise<boolean> {
    return !!(await this.prisma.team.findUnique({ where: { id } }));
  }
}

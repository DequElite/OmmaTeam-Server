import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, RedisService } from 'omma-shared-lib';
import { CreateTeamServiceDto } from './dto/createTeam.dto';
import { Team, User } from 'omma-shared-lib/generated/prisma';
import { ChangeTeamNameDto } from './dto/changeTeam.dto';
import { CachedTeam } from 'src/types/team.types';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  public async getTeamData(email: string, team: Team) {
    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const user = await this.checkIfUserExists(email);

    if (!user) {
      throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
    }

    const teammate = await this.prisma.teammate.findFirst({
      where: {
        userId: user.id,
        teamId: team.id,
      },
    });

    if (!teammate) {
      throw new HttpException('TEAMMATE_NOT_FOUND', HttpStatus.FORBIDDEN);
    }

    const isTeammate = !!teammate && teammate.isAccepted;
    const isLeader = team.leaderId === user.id;

    const teamData = {
      ...team,
      isTeammate,
      isLeader,
    };

    console.log(user, teamData);

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

    const team = await this.prisma.team.update({
      where: {
        id: dto.id,
      },
      include: {
        teammates: {
          include: {
            user: true,
          },
        },
      },
      data: {
        name: dto.name,
      },
    });

    await this.redis.setTeam<CachedTeam>(team.id, team);

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

    await this.prisma.message.deleteMany({
      where: {
        sender: {
          teamId: teamId,
        },
      },
    });

    await this.prisma.subTask.deleteMany({
      where: {
        task: {
          teamId: teamId,
        },
      },
    });

    await this.prisma.task.deleteMany({
      where: {
        assignedTo: {
          teamId: teamId,
        },
      },
    });

    await this.prisma.teammate.deleteMany({
      where: { teamId },
    });

    await this.prisma.team.delete({
      where: { id: teamId },
    });

    await this.redis.delTeam(teamId);

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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import { CreateTeamServiceDto } from './dto/createTeam.dto';
import { User } from 'omma-shared-lib/generated/prisma';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  public async createTeam(dto: CreateTeamServiceDto) {
    const user = await this.checkIfUserExists(dto.leaderId);

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

    await this.prisma.team.delete({
      where: { id: teamId },
    });
    return {
      message: 'Team deleted successfully',
    };
  }

  private async checkIfUserExists(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User does not exist');
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

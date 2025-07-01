import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import { GetUserTasksServiceDto } from './dto/data.dto';

@Injectable()
export class DataManagementService {
  constructor(private readonly prisma: PrismaService) {}

  public async getUserTasks(body: GetUserTasksServiceDto) {
    const team = await this.checkIfTeamExists(body.teamId);
    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const user = await this.checkIfUserExists(body.userEmail);
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const teammate = await this.checkIfTeamMateExists(body.teamId, user.id);
    if (!teammate) {
      throw new HttpException('TEAMMATE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Access granted',
      tasks: teammate.assigned_tasks,
    };
  }

  private async checkIfTeamExists(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    return team;
  }

  private async checkIfUserExists(userEmail: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
  }

  private async checkIfTeamMateExists(teamId: string, userId: string) {
    const teammate = await this.prisma.teammate.findFirst({
      where: {
        teamId,
        userId,
      },
      include: {
        assigned_tasks: true,
      },
    });

    return teammate;
  }
}

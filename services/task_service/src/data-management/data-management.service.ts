import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import {
  GetAllTeamTasksDto,
  GetTaskServiceDto,
  GetUserTasksServiceDto,
} from './dto/data.dto';

@Injectable()
export class DataManagementService {
  constructor(private readonly prisma: PrismaService) {}

  public async getAllTeamTasks(body: GetAllTeamTasksDto) {
    const { user, team } = await this.FullTeammateChecker(body);

    if (team.leaderId !== user.id) {
      throw new HttpException('USER_NOT_LEADER', HttpStatus.FORBIDDEN);
    }

    const tasks = team.tasks;

    return {
      message: 'Access Granted',
      tasks,
    };
  }

  public async getUserTasks(body: GetUserTasksServiceDto) {
    const { teammate } = await this.FullTeammateChecker({
      teamId: body.teamId,
      userEmail: body.userEmail,
    });

    return {
      message: 'Access granted',
      tasks: teammate.assigned_tasks,
    };
  }

  public async getTask(body: GetTaskServiceDto) {
    const { team, user } = await this.FullTeammateChecker({
      teamId: body.teamId,
      userEmail: body.userEmail,
    });

    const task = await this.checkIfUserCanSeeThisTask(
      body.taskId,
      team.id,
      user.id,
    );
    if (!task) {
      throw new HttpException('TASK_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Access granted',
      task,
    };
  }

  private async FullTeammateChecker(body: {
    teamId: string;
    userEmail: string;
  }) {
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
      team,
      user,
      teammate,
    };
  }

  private async checkIfTeamExists(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        tasks: {
          include: {
            subtasks: true,
          },
        },
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

  private async checkIfUserCanSeeThisTask(
    taskId: string,
    teamId: string,
    userID: string,
  ) {
    const team = await this.checkIfTeamExists(teamId);
    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!task) {
      throw new HttpException('TASK_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const teammate = await this.checkIfTeamMateExists(team.id, userID);
    if (!teammate) {
      throw new HttpException('TEAMMATE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (team?.leaderId === userID) {
      return task;
    }

    if (task.assignedToId === teammate.id) {
      return task;
    }

    return null;
  }
}

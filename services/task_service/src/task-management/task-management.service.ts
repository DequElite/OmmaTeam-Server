import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import { CreateTaskServiceDto } from './dto/task.dto';
import { Task, TasksTypes } from 'omma-shared-lib/generated/prisma';

@Injectable()
export class TaskManagementService {
  constructor(private readonly prisma: PrismaService) {}

  public async createTask(body: CreateTaskServiceDto) {
    const team = await this.checkIfTeamExists(body.teamId);
    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const teammate = await this.checkIfTeamMateExists(
      body.teamId,
      body.teammateId,
    );
    if (!teammate) {
      throw new HttpException('TEAMMATE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (!body.subtasks && body.type === TasksTypes.SUBTASKS) {
      throw new HttpException(
        'SUBTASKS_MUST_BE_IN_SUBTASKED',
        HttpStatus.BAD_REQUEST,
      );
    }

    let newTask: Task;

    const baseTaskData = {
      title: body.title,
      deadline: body.deadline,
      type: body.type,
      hardLevel: body.hardLevel,
      description: body.description,
      teamId: team.id,
      assignedToId: teammate.id,
    };

    if (body.type === TasksTypes.DEFAULT) {
      newTask = await this.prisma.task.create({
        data: {
          ...baseTaskData,
        },
      });
    } else if (body.type === TasksTypes.SUBTASKS && body.subtasks) {
      newTask = await this.prisma.task.create({
        data: {
          ...baseTaskData,
          subtasks: {
            create: body.subtasks.map((subtask) => ({
              name: subtask.name,
            })),
          },
        },
      });
    } else {
      throw new HttpException('INVALID_TASK_TYPE', HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'Task created success',
      newTask,
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

  private async checkIfTeamMateExists(teamId: string, teammateId: string) {
    const teammate = await this.prisma.teammate.findFirst({
      where: {
        teamId,
        id: teammateId,
      },
    });

    return teammate;
  }
}

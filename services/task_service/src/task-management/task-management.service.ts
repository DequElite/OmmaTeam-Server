import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'omma-shared-lib';
import {
  CheckSubTaskServiceDto,
  CompleteTaskServiceDto,
  CreateTaskServiceDto,
  DeleteTaskServiceDto,
} from './dto/task.dto';
import {
  SubTasksStatus,
  Task,
  TasksTypes,
} from 'omma-shared-lib/generated/prisma';

@Injectable()
export class TaskManagementService {
  constructor(private readonly prisma: PrismaService) {}

  public async completeTask(body: CompleteTaskServiceDto) {
    const team = await this.checkIfTeamExists(body.teamId);
    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const teammate = await this.checkIfTeammateByUserEmail(
      body.userEmail,
      body.teamId,
    );
    if (!teammate) {
      throw new HttpException('NOT_TEAMMATE', HttpStatus.FORBIDDEN);
    }

    const task = await this.checkIfTaskForTeammate(teammate.id, body.taskId);
    if (!task) {
      throw new HttpException('TASK_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (task.type === TasksTypes.DEFAULT) {
      await this.completeTaskById(task.id);
    }
    if (task.type === TasksTypes.SUBTASKS) {
      const unfinishedCount = await this.prisma.subTask.count({
        where: {
          taskId: task.id,
          status: {
            not: SubTasksStatus.COMPLETED,
          },
        },
      });

      if (unfinishedCount === 0) {
        await this.completeTaskById(task.id);
      } else {
        throw new HttpException(
          'SUBTASKS_NOT_COMPLETED',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return {
      message: 'Task marked as completed',
      taskId: task.id,
    };
  }

  public async checkSubTask(body: CheckSubTaskServiceDto) {
    const team = await this.checkIfTeamExists(body.teamId);
    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const teammate = await this.checkIfTeammateByUserEmail(
      body.userEmail,
      body.teamId,
    );
    if (!teammate) {
      throw new HttpException('NOT_TEAMMATE', HttpStatus.FORBIDDEN);
    }

    const task = await this.checkIfTaskForTeammate(teammate.id, body.taskId);
    if (!task) {
      throw new HttpException('TASK_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const subtask = await this.prisma.subTask.findFirst({
      where: {
        id: body.subtaskId,
        taskId: body.taskId,
      },
    });
    if (!subtask) {
      throw new HttpException('SUBTASK_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.prisma.subTask.update({
      where: {
        taskId: body.taskId,
        id: body.subtaskId,
      },
      data: {
        status: SubTasksStatus.COMPLETED,
      },
    });

    return {
      message: 'Checked',
    };
  }

  public async deleteTask(body: DeleteTaskServiceDto) {
    const team = await this.checkIfTeamExists(body.teamId);
    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.prisma.subTask.deleteMany({
      where: {
        taskId: body.taskId,
      },
    });

    await this.prisma.task.delete({
      where: {
        id: body.taskId,
      },
    });

    return {
      message: 'deleted success',
    };
  }

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

  private async checkIfTaskForTeammate(teammateId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        assignedToId: teammateId,
      },
    });

    return task;
  }

  private async checkIfTeammateByUserEmail(email: string, teamId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    const teammate = await this.prisma.teammate.findFirst({
      where: {
        teamId,
        userId: user?.id,
      },
    });

    return teammate;
  }

  private async completeTaskById(taskId: string) {
    await this.prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: true },
    });
  }
}

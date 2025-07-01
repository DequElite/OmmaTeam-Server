import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TaskManagementService } from './task-management.service';
import {
  IsTeamLeaderGuard,
  JwtauthGuard,
  TeamGuardGuard,
} from 'omma-shared-lib';
import {
  CheckSubTaskDto,
  CompleteTaskDto,
  CreateTaskDto,
  DeleteTaskDto,
} from './dto/task.dto';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Task Management')
@Controller('task-management')
export class TaskManagementController {
  constructor(private readonly taskManagementService: TaskManagementService) {}

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Post('create/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create team task for one person in team' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teammate not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid task type',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid task type',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User not team leader',
  })
  async create(@Body() body: CreateTaskDto, @Param('id') teamId: string) {
    try {
      const { message, newTask } = await this.taskManagementService.createTask({
        ...body,
        teamId,
      });

      return {
        message,
        newTask,
      };
    } catch (err) {
      console.error('Error during creating task:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Body() body: DeleteTaskDto, @Param('id') teamId: string) {
    try {
      const { message } = await this.taskManagementService.deleteTask({
        ...body,
        teamId,
      });

      return {
        message,
      };
    } catch (err) {
      console.error('Error during deleting task:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard)
  @Patch('subtask/:id')
  @HttpCode(HttpStatus.OK)
  async checkSubTask(
    @Body() body: CheckSubTaskDto,
    @Param('id') teamId: string,
    @Req() req: Request,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const user = req['user'];
      if (!user) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message } = await this.taskManagementService.checkSubTask({
        ...body,
        teamId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userEmail: user.email,
      });

      return {
        message,
      };
    } catch (err) {
      console.error('Error during checking task:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard)
  @Patch('complete/:id')
  @HttpCode(HttpStatus.OK)
  async completeTask(
    @Body() body: CompleteTaskDto,
    @Param('id') teamId: string,
    @Req() req: Request,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const user = req['user'];
      if (!user) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message, taskId } = await this.taskManagementService.completeTask(
        {
          ...body,
          teamId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          userEmail: user.email,
        },
      );

      return {
        message,
        taskId,
      };
    } catch (err) {
      console.error('Error during completing task:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}

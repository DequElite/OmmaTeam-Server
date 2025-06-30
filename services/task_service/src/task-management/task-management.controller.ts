import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
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
import { CreateTaskDto } from './dto/task.dto';
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
}

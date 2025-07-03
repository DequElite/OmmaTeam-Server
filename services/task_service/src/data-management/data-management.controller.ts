import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DataManagementService } from './data-management.service';
import {
  IsTeamLeaderGuard,
  JwtauthGuard,
  TeamGuardGuard,
} from 'omma-shared-lib';
import { Request } from 'express';
import { GetTaskDto } from './dto/data.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('data Management')
@Controller('data-management')
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}

  @UseGuards(JwtauthGuard, TeamGuardGuard)
  @Get('/tasks/personal/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tasks assigned to the current user in a specific team',
  })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Tasks successfully retrieved' })
  @ApiResponse({ status: 404, description: 'TEAM_NOT_FOUND' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN_TEAM' })
  async getUserTasks(@Param('id') teamId: string, @Req() req: Request) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const user = req['user'];
      if (!user) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message, tasks } = await this.dataManagementService.getUserTasks({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userEmail: user.email,
        teamId,
      });

      return {
        message,
        tasks,
      };
    } catch (err) {
      console.error('Error during getting user task:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard)
  @Get('/task/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific task by ID if user is leader or assigned',
  })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiBody({ type: GetTaskDto })
  @ApiResponse({ status: 200, description: 'Task successfully retrieved' })
  @ApiResponse({ status: 404, description: 'TASK_NOT_FOUND' })
  async getTask(
    @Param('id') teamId: string,
    @Req() req: Request,
    @Body() body: GetTaskDto,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const user = req['user'];
      if (!user) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message, task } = await this.dataManagementService.getTask({
        ...body,
        teamId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userEmail: user.email,
      });

      return {
        message,
        task,
      };
    } catch (err) {
      console.error('Error during getting task:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Get('/tasks/all/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tasks in a team (only for team leader)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 200,
    description: 'All team tasks successfully retrieved',
  })
  @ApiResponse({ status: 400, description: 'USER_NOT_EXISTS' })
  @ApiResponse({ status: 403, description: 'USER_NOT_TEAM_LEADER' })
  async getAllTeamTasks(@Param('id') teamId: string, @Req() req: Request) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const user = req['user'];
      if (!user) {
        throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message, tasks } =
        await this.dataManagementService.getAllTeamTasks({
          teamId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          userEmail: user.email,
        });

      return {
        message,
        tasks,
      };
    } catch (err) {
      console.error('Error during getting all team tasks:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}

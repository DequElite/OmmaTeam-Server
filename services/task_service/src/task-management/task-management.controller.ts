import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { TaskManagementService } from './task-management.service';
import {
  IsTeamLeaderGuard,
  JwtauthGuard,
  TeamGuardGuard,
} from 'omma-shared-lib';
import { CreateTaskDto } from './dto/task.dto';

@Controller('task-management')
export class TaskManagementController {
  constructor(private readonly taskManagementService: TaskManagementService) {}

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Post('create/:id')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateTaskDto) {

  }
}

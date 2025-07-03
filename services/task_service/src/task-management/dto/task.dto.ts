import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  SubTask,
  TasksHardLevels,
  TasksTypes,
} from 'omma-shared-lib/generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'b1f226bb-d40a-4cfc-a902-0f55bb2c0d01',
    description: 'Teammate ID to assign the task to',
  })
  @IsUUID(undefined, { message: 'teammateId must be an uuid' })
  teammateId: string;

  @ApiProperty({ example: 'Fix login bug', description: 'Title of the task' })
  @IsString({ message: 'title must be a string' })
  title: string;

  @ApiProperty({
    example: '2025-08-01T12:00:00.000Z',
    description: 'Deadline of the task',
  })
  @Type(() => Date)
  @IsDate({ message: 'deadline must be a date' })
  deadline: Date;

  @ApiProperty({
    enum: TasksTypes,
    example: TasksTypes.DEFAULT,
    description: 'Type of the task (DEFAULT or SUBTASKS)',
  })
  @IsEnum(TasksTypes, { message: 'type must be a def or subtasks' })
  type: TasksTypes;

  @ApiProperty({
    enum: TasksHardLevels,
    example: TasksHardLevels.MEDIUM,
    description: 'Difficulty level of the task',
  })
  @IsEnum(TasksHardLevels, { message: 'hardLevel must be a TasksHardLevels' })
  hardLevel: TasksHardLevels;

  @ApiProperty({
    example: 'User cannot login due to server error.',
    description: 'Description of the task',
  })
  @IsString({ message: 'description must be a string' })
  description: string;

  @ApiProperty({
    type: [Object],
    required: false,
    description: 'List of subtasks if the task type is SUBTASKS',
  })
  @IsArray({ message: 'subtasks must be an array' })
  @IsOptional()
  subtasks?: SubTask[];
}

export class CreateTaskServiceDto extends CreateTaskDto {
  @ApiProperty({
    example: '5e963a94-364e-4df1-a4a4-b01b47e89f23',
    description: 'ID of the team that owns the task',
  })
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;
}

export class DeleteTaskDto {
  @ApiProperty({
    example: '2d4e6a2a-bc18-4666-927e-2b11437e7f4d',
    description: 'Task ID to delete',
  })
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;
}

export class DeleteTaskServiceDto extends DeleteTaskDto {
  @ApiProperty({
    example: 'e5c9ab9d-bf2a-432a-a0c0-50e8969c7bd7',
    description: 'ID of the team owning the task',
  })
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;
}

export class CheckSubTaskDto {
  @ApiProperty({
    example: 'fcfb302c-b5fc-45d4-8677-79f87736285f',
    description: 'ID of the task',
  })
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;

  @ApiProperty({
    example: '1e504beb-676f-4cf4-a716-4c6326a3dfc6',
    description: 'ID of the subtask to check off',
  })
  @IsUUID(undefined, { message: 'subtaskId must be an uuid' })
  subtaskId: string;
}

export class CheckSubTaskServiceDto extends CheckSubTaskDto {
  @ApiProperty({
    example: '7f3a7bfa-e478-401a-bbdf-18f0ff9241be',
    description: 'ID of the team',
  })
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the user checking the subtask',
  })
  @IsEmail()
  userEmail: string;
}

export class CompleteTaskDto {
  @ApiProperty({
    example: '2b8ed40c-5ec3-4d76-83d4-199b8a015038',
    description: 'ID of the task to complete',
  })
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;
}

export class CompleteTaskServiceDto extends CompleteTaskDto {
  @ApiProperty({
    example: 'b93be255-cf35-4b69-94e2-46d4dd8e2d52',
    description: 'ID of the team',
  })
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the user marking the task as complete',
  })
  @IsEmail()
  userEmail: string;
}

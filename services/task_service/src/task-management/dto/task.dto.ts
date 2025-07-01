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

export class CreateTaskDto {
  @IsUUID(undefined, { message: 'teammateId must be an uuid' })
  teammateId: string;

  @IsString({ message: 'title must be a string' })
  title: string;

  @Type(() => Date)
  @IsDate({ message: 'deadline must be a date' })
  deadline: Date;

  @IsEnum(TasksTypes, { message: 'type must be a def or subtasks' })
  type: TasksTypes;

  @IsEnum(TasksHardLevels, { message: 'hardLevel must be a TasksHardLevels' })
  hardLevel: TasksHardLevels;

  @IsString({ message: 'description must be a string' })
  description: string;

  @IsArray({ message: 'subtasks must be an array' })
  @IsOptional()
  subtasks?: SubTask[];
}
export class CreateTaskServiceDto extends CreateTaskDto {
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;
}

export class DeleteTaskDto {
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;
}
export class DeleteTaskServiceDto extends DeleteTaskDto {
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;
}

export class CheckSubTaskDto {
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;

  @IsUUID(undefined, { message: 'subtaskId must be an uuid' })
  subtaskId: string;
}
export class CheckSubTaskServiceDto extends CheckSubTaskDto {
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;

  @IsEmail()
  userEmail: string;
}

export class CompleteTaskDto {
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;
}
export class CompleteTaskServiceDto extends CompleteTaskDto {
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;

  @IsEmail()
  userEmail: string;
}

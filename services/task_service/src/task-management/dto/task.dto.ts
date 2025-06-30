import { IsArray, IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SubTask, TasksHardLevels, TasksTypes } from 'omma-shared-lib/generated/prisma';

export class CreateTaskDto {
    @IsUUID(undefined, { message: 'teammateId must be an uuid' })
    teammateId: string;

    @IsString({message: 'title must be a string'})
    title: string;

    @Type(() => Date)
    @IsDate({ message: 'deadline must be a date' })
    deadline: Date;

    @IsEnum(TasksTypes, { message: 'type must be a def or subtasks' })
    type: TasksTypes;

    @IsEnum(TasksHardLevels, { message: 'hardLevel must be a TasksHardLevels' })
    hardLevel: TasksHardLevels;

    @IsString({message: 'description must be a string'})
    description: string;

    @IsArray({message:''})
    @IsOptional()
    subtasks?: SubTask[];
}
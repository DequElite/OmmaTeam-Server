import { IsEmail, IsUUID } from 'class-validator';

export class GetUserTasksServiceDto {
  @IsEmail()
  userEmail: string;

  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;
}

export class GetTaskDto {
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;
}

export class GetTaskServiceDto extends GetTaskDto {
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;

  @IsEmail()
  userEmail: string;
}

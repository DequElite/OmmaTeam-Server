import { IsEmail, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserTasksServiceDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  userEmail: string;

  @ApiProperty({
    example: 'a63dcbff-b60d-4c95-a053-f7e57eaeb8a2',
    description: 'UUID of the team',
  })
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;
}

export class GetTaskDto {
  @ApiProperty({
    example: '99c1dcbd-1c37-4661-a890-3cbe48eeeb6b',
    description: 'UUID of the task',
  })
  @IsUUID(undefined, { message: 'taskId must be an uuid' })
  taskId: string;
}

export class GetTaskServiceDto extends GetTaskDto {
  @ApiProperty({
    example: 'a63dcbff-b60d-4c95-a053-f7e57eaeb8a2',
    description: 'UUID of the team',
  })
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  userEmail: string;
}

export class GetAllTeamTasksDto {
  @ApiProperty({
    example: 'a63dcbff-b60d-4c95-a053-f7e57eaeb8a2',
    description: 'UUID of the team',
  })
  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;

  @ApiProperty({
    example: 'leader@example.com',
    description: 'Email of the team leader',
  })
  @IsEmail()
  userEmail: string;
}

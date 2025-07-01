import { IsEmail, IsUUID } from 'class-validator';

export class GetUserTasksServiceDto {
  @IsEmail()
  userEmail: string;

  @IsUUID(undefined, { message: 'teamId must be an uuid' })
  teamId: string;
}

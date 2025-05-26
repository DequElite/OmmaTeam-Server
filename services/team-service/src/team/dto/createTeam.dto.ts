import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateTeamControllerDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString({
    message: 'Name must be a string',
  })
  name: string;
}

export class CreateTeamServiceDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString({
    message: 'Name must be a string',
  })
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail()
  email: string;
}

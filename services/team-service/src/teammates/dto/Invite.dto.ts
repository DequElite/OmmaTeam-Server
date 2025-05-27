import { IsString, IsUUID } from 'class-validator';

export class InviteUserDto {
  @IsString({
    message: 'Email must be a string',
  })
  email: string;

  @IsUUID(undefined, {
    message: 'Team ID must be a uuid',
  })
  teamId: string;
}

export class AcceptInvationDto {
  @IsString({
    message: 'Email must be a string',
  })
  email: string;

  @IsUUID(undefined, {
    message: 'Invite token must be a uuid',
  })
  inviteToken: string;
}

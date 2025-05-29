import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateTeamControllerDto {
  @IsString({
    message: 'Name must be a string',
  })
  @ApiProperty({ example: 'DexTeam', description: 'Team name' })
  name: string;
}

export class CreateTeamServiceDto {
  @IsString({
    message: 'Name must be a string',
  })
  @ApiProperty({ example: 'DexTeam', description: 'Team name' })
  name: string;

  @IsEmail({}, { message: 'Email must be valid' })
  @ApiProperty({
    example: 'dexteamleader@gmail.com',
    description: 'Leader mail',
  })
  email: string;
}

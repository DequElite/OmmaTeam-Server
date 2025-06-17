import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString } from 'class-validator';

export class ChangeTeamNameDto {
  @IsString({
    message: 'Name must be a string',
  })
  @ApiProperty({ example: 'DexTeam', description: 'Team name' })
  name: string;

  @IsUUID(undefined, {
    message: 'Name must be a uuid',
  })
  @ApiProperty({ example: 'DexTeam', description: 'Team name' })
  id: string;
}

export class ChangeTeamDto {
  @IsString()
  name: string;
}

import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeammatesService } from './teammates.service';
import { console } from 'inspector';
import { JwtauthGuard } from 'omma-shared-lib';
import { TeamGuardGuard } from 'src/team-guard/team-guard.guard';
import { IsTeamLeaderGuard } from 'src/is-team-leader/is-team-leader.guard';
import { InviteUserDto } from './dto/Invite.dto';

@Controller('teammates')
export class TeammatesController {
  constructor(private readonly teammatesService: TeammatesService) {}

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Post('invite/:id')
  @HttpCode(HttpStatus.OK)
  public async invite(@Body() body: InviteUserDto) {
    try {
      const { message } = await this.teammatesService.inviteByMail(body);

      return {
        message,
      };
    } catch (err) {
      console.error('Error during creating team:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}

import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeammatesService } from './teammates.service';
import { console } from 'inspector';
import { JwtauthGuard } from 'omma-shared-lib';
import { TeamGuardGuard } from 'src/team-guard/team-guard.guard';
import { IsTeamLeaderGuard } from 'src/is-team-leader/is-team-leader.guard';
import {
  AcceptInvationDto,
  DeleteTeammateDto,
  InviteUserDto,
} from './dto/Invite.dto';

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

  @UseGuards(JwtauthGuard)
  @Post('invite/accept')
  @HttpCode(HttpStatus.OK)
  public async acceptInvation(@Body() body: AcceptInvationDto) {
    try {
      const { message, teamId } =
        await this.teammatesService.acceptInvation(body);

      return {
        message,
        teamId,
      };
    } catch (err) {
      console.error('Error during acceping invation:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  public async deleteTeammate(@Body() body: DeleteTeammateDto) {
    try {
      const { message } = await this.teammatesService.deleteTeammtae(body);

      return {
        message,
      };
    } catch (err) {
      console.error('Error during deleting teammate:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}

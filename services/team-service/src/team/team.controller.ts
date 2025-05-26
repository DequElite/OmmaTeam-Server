import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtauthGuard } from 'omma-shared-lib';
import { TeamGuardGuard } from 'src/team-guard/team-guard.guard';
import { Team, User } from 'omma-shared-lib/generated/prisma';
import { CreateTeamControllerDto } from './dto/createTeam.dto';
import { IsTeamLeaderGuard } from 'src/is-team-leader/is-team-leader.guard';

interface IRequestWithTeam extends Request {
  team?: Team;
}

interface IRequestWithUser extends Request {
  user?: User;
}

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtauthGuard, TeamGuardGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public getTeam(@Req() req: IRequestWithTeam) {
    const team = req.team;

    return {
      message: 'access granted',
      team,
    };
  }

  @UseGuards(JwtauthGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  public async createTeam(
    @Body() body: CreateTeamControllerDto,
    @Req() req: IRequestWithUser,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
      }

      const { message, team } = await this.teamService.createTeam({
        name: body.name,
        leaderId: user.id,
      });
      return {
        message,
        team,
      };
    } catch (err) {
      console.error('Error during creating team:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  public async deleteTeam(@Req() req: IRequestWithTeam) {
    try {
      const team = req.team;
      if (!team) {
        throw new HttpException('TEAM_ID_BOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message } = await this.teamService.deleteTeam(team.id);
      return { message };
    } catch (err) {
      console.error('Error during deleting team:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}

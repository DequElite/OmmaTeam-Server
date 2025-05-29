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
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

interface IRequestWithTeam extends Request {
  team?: Team;
}

interface IRequestWithUser extends Request {
  user?: User;
}

@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtauthGuard, TeamGuardGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user and teamId not exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User not in team',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or team not found',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access granted',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the team',
    example: '123e4567-e89b-12d3-a456-426614174000', // класний UUID
  })
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
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Team created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Team already exists',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBody({ type: CreateTeamControllerDto })
  public async createTeam(
    @Body() body: CreateTeamControllerDto,
    @Req() req: IRequestWithUser,
  ) {
    try {
      const user = req.user;
      console.log('USER AT CREATE TEAM SERVICE: ', user);
      if (!user) {
        throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
      }

      const { message, team } = await this.teamService.createTeam({
        name: body.name,
        email: user.email,
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
  @ApiOperation({ summary: 'Delete team' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Team deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'user and teamId not exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User not in team or user not leader of team',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or team not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the team',
    example: '123e4567-e89b-12d3-a456-426614174000', // класний UUID
  })
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

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import {
  IsTeamLeaderGuard,
  JwtauthGuard,
  TeamGuardGuard,
} from 'omma-shared-lib';
import { CreateTeamControllerDto } from './dto/createTeam.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChangeTeamDto } from './dto/changeTeam.dto';
import { IRequestWithTeam, IRequestWithUser } from 'src/types/request.types';

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
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  public async getTeam(@Req() req: IRequestWithTeam & IRequestWithUser) {
    const team = req.team;

    if (!team) {
      throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (!req.user) {
      throw new HttpException('USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
    }

    const { message, team: teamData } = await this.teamService.getTeamData(
      req.user?.email,
      team,
    );

    return {
      message: message,
      team: teamData,
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

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Patch('/change/name/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change team name' })
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
    description: 'Team not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the team',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  public async changeTeamName(
    @Body() body: ChangeTeamDto,
    @Req() req: IRequestWithTeam,
  ) {
    try {
      const team = req.team;
      if (!team) {
        throw new HttpException('TEAM_ID_BOT_EXISTS', HttpStatus.BAD_REQUEST);
      }

      const { message } = await this.teamService.changeTeamName({
        id: team.id,
        name: body.name,
      });

      return {
        message,
      };
    } catch (err) {
      console.error('Error during deleting team:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}

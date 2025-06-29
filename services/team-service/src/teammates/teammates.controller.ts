import {
  Body,
  Controller,
  Get,
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
import { IsTeamLeaderGuard, JwtauthGuard, TeamGuardGuard } from 'omma-shared-lib';
import {
  AcceptInvationDto,
  DeleteTeammateDto,
  InviteUserDto,
} from './dto/Invite.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { IRequestWithTeam } from 'src/types/request.types';

@Controller('teammates')
export class TeammatesController {
  constructor(private readonly teammatesService: TeammatesService) {}

  @UseGuards(JwtauthGuard, TeamGuardGuard)
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get teammares' })
  @ApiParam({ name: 'id', required: true, description: 'Team ID' })
  public getTeammates(@Req() req: IRequestWithTeam) {
    try {
      const team = req.team;

      if (!team) {
        throw new HttpException('TEAM_NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'access granted',
        teammates: team.teammates,
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
  @Post('invite/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invite user to team by email' })
  @ApiParam({ name: 'id', required: true, description: 'Team ID' })
  @ApiBody({ type: InviteUserDto })
  @ApiResponse({ status: 200, description: 'Invite sent' })
  @ApiResponse({
    status: 400,
    description: 'User already in team or bad request',
  })
  @ApiResponse({ status: 404, description: 'User or team not found' })
  public async invite(@Body() body: InviteUserDto) {
    try {
      const { message } = await this.teammatesService.inviteByMail(body);

      return {
        message,
      };
    } catch (err) {
      console.error('Error during inviting user:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard)
  @Post('acceptinvitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept team invitation' })
  @ApiBody({ type: AcceptInvationDto })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @ApiResponse({ status: 404, description: 'Teammate or token not found' })
  @ApiResponse({ status: 400, description: 'Token expired or invalid' })
  public async acceptInvation(@Body() body: AcceptInvationDto) {
     console.log('🔥 acceptInvation received body:', body);
    try {
      const { message, teamId } =
        await this.teammatesService.acceptInvation(body);

      return {
        message,
        teamId,
      };
    } catch (err) {
      console.error('Error during accepting invation:', err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  @UseGuards(JwtauthGuard, TeamGuardGuard, IsTeamLeaderGuard)
  @Post('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete teammate from team' })
  @ApiBody({ type: DeleteTeammateDto })
  @ApiResponse({ status: 200, description: 'Teammate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Teammate not found' })
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

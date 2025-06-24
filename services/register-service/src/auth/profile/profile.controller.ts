import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	InternalServerErrorException,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request, Response } from 'express';
import { JwtauthGuard } from 'omma-shared-lib';
import { TPartialChange, TPasswordChangeDto } from '../dto/changeAuth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth/profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@UseGuards(JwtauthGuard)
	@Get()
	@ApiOperation({ summary: 'Get user data from auth token' })
	@ApiResponse({
		status: 200,
		description: 'User data retrieved successfully',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	@HttpCode(HttpStatus.OK)
	public getProfileData(@Req() req: Request) {
		const userData = req.user;
		return {
			message: 'access granted',
			user: userData,
		};
	}

	@UseGuards(JwtauthGuard)
	@Get('/teams')
	@ApiOperation({ summary: 'Get user teams data from auth token' })
	@ApiResponse({
		status: 200,
		description: 'User teams data retrieved successfully',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	@ApiResponse({
		status: 400,
		description: 'User id not exists',
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	@HttpCode(HttpStatus.OK)
	public async getUserTeamsData(@Req() req: Request) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			const userData = req.user as any;

			console.log(userData);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (!userData || !userData.email) {
				throw new HttpException('USERID_NOT_EXIST', HttpStatus.BAD_REQUEST);
			}

			const { message, teams } = await this.profileService.getUserTeamsData(
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
				userData.email,
			);

			return {
				message,
				teams,
			};
		} catch (err) {
			console.error('Error during getting user data: ', err);

			if (err instanceof HttpException) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}

	@UseGuards(JwtauthGuard)
	@Patch('/change-password')
	@ApiOperation({ summary: 'Change user password' })
	@ApiOperation({ summary: 'Change user password' })
	@ApiResponse({
		status: 200,
		description: 'Password updated successfully',
		schema: { example: { message: 'Password updated successfully' } },
	})
	@ApiResponse({ status: 400, description: 'Missing password fields' })
	@ApiResponse({ status: 401, description: 'Invalid old password' })
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	@HttpCode(HttpStatus.OK)
	public async changePassword(
		@Req() req: Request,
		@Body() dto: TPasswordChangeDto,
	) {
		try {
			const { message } = await this.profileService.changeUserPassword(
				dto,
				req.user,
			);

			return { message };
		} catch (err) {
			console.error('Error during changing passowrd:', err);

			if (err instanceof HttpException) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}

	@UseGuards(JwtauthGuard)
	@Patch('/change-profile')
	@ApiOperation({ summary: 'Change user email or username' })
	@ApiResponse({
		status: 200,
		description: 'User data successfully updated',
		schema: {
			example: {
				message: 'User data successfully updated',
				accessToken: 'new-access-token',
			},
		},
	})
	@ApiResponse({ status: 400, description: 'Missing data fields' })
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	@HttpCode(HttpStatus.OK)
	public async changeUserData(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() dto: TPartialChange,
	) {
		try {
			const { message, refreshToken, accessToken } =
				await this.profileService.changeUserData(dto, req.user);

			const isProd = process.env.NODE_ENV === 'production';

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: isProd,
				sameSite: isProd ? 'none' : 'lax',
				maxAge: 3 * 24 * 60 * 60 * 1000,
			});

			return {
				message,
				accessToken,
			};
		} catch (err) {

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}

	@UseGuards(JwtauthGuard)
	@Post('/logout')
	@ApiOperation({ summary: 'Log out' })
	@HttpCode(HttpStatus.OK)
	public async logOut(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			await this.profileService.logOut(req.user);

			const isProd = process.env.NODE_ENV === 'production';

			res.clearCookie('refreshToken', {
				httpOnly: true,
				secure: isProd,
				sameSite: isProd ? 'none' : 'lax',
			});

			return {
				message: 'logged out success',
			};
		} catch (err) {
			console.error('Error during log out: ', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

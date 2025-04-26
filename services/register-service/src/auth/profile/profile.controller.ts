import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request, Response } from 'express';
import { JwtauthGuard } from 'omma-shared-lib';
import { TPartialChange, TPasswordChangeDto } from '../dto/changeAuth.dto';

@Controller('auth/profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@UseGuards(JwtauthGuard)
	@Get()
	public async getProfileData(@Req() req: Request) {
		const userData = req.user;
		return {
			message: 'access granted',
			user: userData,
		};
	}

	@UseGuards(JwtauthGuard)
	@Post('/change-password')
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

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}

	@UseGuards(JwtauthGuard)
	@Post('/change-profile')
	public async changeUserData(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() dto: TPartialChange,
	) {
		try {
			const { message, refreshToken, accessToken } =
				await this.profileService.changeUserData(dto, req.user);

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'none',
				maxAge: 3 * 24 * 60 * 60 * 1000,
			});

			return {
				message,
				accessToken,
			};
		} catch (err) {
			console.error('Error during changing user data:', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

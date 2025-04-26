import {
	Controller,
	Get,
	InternalServerErrorException,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { GoogleSignService } from './google-sign.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { TEmailAndUsernameRequiredSignDto } from '../dto/sign-up.dto';

@Controller('sign/google-sign')
export class GoogleSignController {
	constructor(private readonly googleSignService: GoogleSignService) {}

	@Get()
	@UseGuards(AuthGuard('google'))
	public async googleAuth() {}

	@Get('/callback')
	@UseGuards(AuthGuard('google'))
	public async googleAuthCallback(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const user = req.user as TEmailAndUsernameRequiredSignDto;
			const { message, refreshToken, accessToken } =
				await this.googleSignService.registerUserWithGoogle(user);

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'none',
				maxAge: 3 * 24 * 60 * 60 * 1000,
			});

			return res.redirect(
				`${process.env.CLIENT_REDIRECT_URL}?accessToken=${accessToken}`,
			);
		} catch (err) {
			console.error('Error at registering user by google: ', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

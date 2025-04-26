import {
	Controller,
	Get,
	InternalServerErrorException,
	Req,
	Res,
} from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { Request, Response } from 'express';

@Controller('auth/refresh-tokens')
export class RefreshTokensController {
	constructor(private readonly refreshTokensService: RefreshTokensService) {}

	@Get()
	public async refreshUserToken(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const refreshToken = req.cookies.refreshToken;

			const { message, accessToken } =
				await this.refreshTokensService.refreshTokens(refreshToken);

			return { message, accessToken };
		} catch (err) {
			console.error('Error during refresh token:', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

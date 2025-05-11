import {
	Controller,
	Get,
	InternalServerErrorException,
	Req,
} from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { Request } from 'express';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth/refresh-tokens')
export class RefreshTokensController {
	constructor(private readonly refreshTokensService: RefreshTokensService) {}

	@Get()
	@ApiOperation({ summary: 'Create new accessToken' })
	public async refreshUserToken(@Req() req: Request) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			const refreshToken = req.cookies.refreshToken;

			const { message, accessToken } =
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				await this.refreshTokensService.refreshTokens(refreshToken);

			return { message, accessToken };
		} catch (err) {
			console.error('Error during refresh token:', err);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

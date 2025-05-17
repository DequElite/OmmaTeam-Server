import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Req,
} from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { Request } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth/refresh-tokens')
export class RefreshTokensController {
	constructor(private readonly refreshTokensService: RefreshTokensService) {}

	@Get()
	@ApiOperation({ summary: 'Create new accessToken' })
	@ApiResponse({
		status: 200,
		description: 'Access token created successfully',
		schema: {
			example: {
				message: 'Access token created successfully',
				accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Refresh token is missing or invalid',
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	@HttpCode(HttpStatus.OK)
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

import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Post,
	Res,
} from '@nestjs/common';
import { LogInService } from './log-in.service';
import { SignDto, TEmailAndPasswordRequiredSignDto } from '../dto/sign-up.dto';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('sign/log-in')
export class LogInController {
	constructor(private readonly logInService: LogInService) {}

	@Post()
	@ApiOperation({ summary: 'Log in user' })
	@ApiBody({ type: SignDto })
	@HttpCode(HttpStatus.OK)
	@ApiResponse({ status: 401, description: 'Invalid password' })
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	public async logInUser(
		@Body() dto: TEmailAndPasswordRequiredSignDto,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const { message, refreshToken, accessToken } =
				await this.logInService.logInUser(dto);

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
			console.error('Error during login:', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

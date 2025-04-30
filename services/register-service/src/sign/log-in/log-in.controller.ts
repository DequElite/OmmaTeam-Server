import {
	Body,
	Controller,
	InternalServerErrorException,
	Post,
	Res,
} from '@nestjs/common';
import { LogInService } from './log-in.service';
import { SignDto, TEmailAndPasswordRequiredSignDto } from '../dto/sign-up.dto';
import { Response } from 'express';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('sign/log-in')
export class LogInController {
	constructor(private readonly logInService: LogInService) {}

	@Post()
	@ApiOperation({ summary: 'Log in user' })
	@ApiBody({ type: SignDto })
	public async logInUser(
		@Body() dto: TEmailAndPasswordRequiredSignDto,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const { message, refreshToken, accessToken } =
				await this.logInService.logInUser(dto);

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
			console.error('Error during login:', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

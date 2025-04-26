import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Post,
	Res,
} from '@nestjs/common';
import { SignUpService } from './sign-up.service';
import { SignDto } from '../dto/sign-up.dto';
import { Response } from 'express';

@Controller('sign/sign-up')
export class SignUpController {
	constructor(private readonly signUpService: SignUpService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	public async registerUser(
		@Body() dto: SignDto,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const { message, refreshToken, accessToken } =
				await this.signUpService.registerUser(dto);

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
			console.error('Error at registering user: ', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}

	@Get('/all')
	public async findALl() {
		return this.signUpService.returnAllUsers();
	}
}

import {
	Body,
	Controller,
	InternalServerErrorException,
	Post,
} from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { PrismaService } from 'omma-shared-lib';
import { ResetPasswordDTO } from '../dto/resetPassword.dto';

@Controller('forgot-password/reset-password')
export class ResetPasswordController {
	constructor(
		private readonly resetPasswordService: ResetPasswordService,
		private readonly prisma: PrismaService,
	) {}

	@Post()
	public async resetPassword(@Body() dto: ResetPasswordDTO) {
		try {
			const { message } = await this.resetPasswordService.resetPassword(dto);
			return {
				message,
			};
		} catch (err) {
			console.error('Error while resetting password: ', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

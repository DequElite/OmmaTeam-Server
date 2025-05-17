import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Post,
} from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { PrismaService } from 'omma-shared-lib';
import { ResetPasswordDTO } from '../dto/resetPassword.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('forgot-password/reset-password')
export class ResetPasswordController {
	constructor(
		private readonly resetPasswordService: ResetPasswordService,
		private readonly prisma: PrismaService,
	) {}

	@Post()
	@ApiOperation({ summary: 'Reset user password to new' })
	@ApiBody({ type: ResetPasswordDTO })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Password reset successfully',
		schema: { example: { message: 'Password reset successfully' } },
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Reset token not found',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Reset token expired',
	})
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: 'Internal server error',
	})
	@HttpCode(HttpStatus.OK)
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

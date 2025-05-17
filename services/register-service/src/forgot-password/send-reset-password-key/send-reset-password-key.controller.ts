import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Post,
} from '@nestjs/common';
import { SendResetPasswordKeyService } from './send-reset-password-key.service';
import { SendResetPasswordKeyDTO } from '../dto/sendKey.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('forgot-password/send-reset-password-key')
export class SendResetPasswordKeyController {
	constructor(
		private readonly sendResetPasswordKeyService: SendResetPasswordKeyService,
	) {}

	@Post()
	@ApiOperation({ summary: 'Send reset password key' })
	@ApiBody({ type: SendResetPasswordKeyDTO })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Password reset email sent',
		schema: { example: { message: 'A password reset email has been sent.' } },
	})
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: 'Server error',
	})
	@HttpCode(HttpStatus.OK)
	public async sendRessetPasswordKey(@Body() dto: SendResetPasswordKeyDTO) {
		try {
			await this.sendResetPasswordKeyService.sendResetKey(dto);
		} catch (err) {
			console.error('Error while sending password reset email: ', err);

			if (err.getStatus) {
				throw err;
			}

			throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
		}
	}
}

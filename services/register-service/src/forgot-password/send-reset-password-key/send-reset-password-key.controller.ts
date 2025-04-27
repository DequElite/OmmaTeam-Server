import {
	Body,
	Controller,
	InternalServerErrorException,
	Post,
} from '@nestjs/common';
import { SendResetPasswordKeyService } from './send-reset-password-key.service';
import { SendResetPasswordKeyDTO } from '../dto/sendKey.dto';

@Controller('forgot-password/send-reset-password-key')
export class SendResetPasswordKeyController {
	constructor(
		private readonly sendResetPasswordKeyService: SendResetPasswordKeyService,
	) {}

	@Post()
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

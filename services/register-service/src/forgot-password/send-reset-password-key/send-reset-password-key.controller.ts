import { Body, Controller, Post } from '@nestjs/common';
import { SendResetPasswordKeyService } from './send-reset-password-key.service';
import { SendResetPasswordKeyDTO } from '../dto/sendKey.dto';

@Controller('forgot-password/send-reset-password-key')
export class SendResetPasswordKeyController {
	constructor(
		private readonly sendResetPasswordKeyService: SendResetPasswordKeyService,
	) {}

	@Post()
	public async sendRessetPasswordKey(@Body() dto: SendResetPasswordKeyDTO) {}
}

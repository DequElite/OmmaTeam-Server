import { Module } from '@nestjs/common';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { SendResetPasswordKeyModule } from './send-reset-password-key/send-reset-password-key.module';

@Module({
	imports: [ResetPasswordModule, SendResetPasswordKeyModule],
})
export class ForgotPasswordModule {}

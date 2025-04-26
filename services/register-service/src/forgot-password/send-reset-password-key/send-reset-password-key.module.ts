import { Module } from '@nestjs/common';
import { SendResetPasswordKeyService } from './send-reset-password-key.service';
import { SendResetPasswordKeyController } from './send-reset-password-key.controller';
import { MailService, PrismaService, SharedModule } from 'omma-shared-lib';

@Module({
	controllers: [SendResetPasswordKeyController],
	providers: [SendResetPasswordKeyService, PrismaService, MailService],
	imports: [SharedModule],
})
export class SendResetPasswordKeyModule {}

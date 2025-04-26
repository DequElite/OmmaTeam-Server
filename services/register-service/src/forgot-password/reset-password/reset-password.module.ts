import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordController } from './reset-password.controller';

@Module({
	controllers: [ResetPasswordController],
	providers: [ResetPasswordService],
})
export class ResetPasswordModule {}

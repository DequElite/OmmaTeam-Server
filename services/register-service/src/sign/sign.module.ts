import { Module } from '@nestjs/common';
import { SignUpModule } from './sign-up/sign-up.module';
import { LogInModule } from './log-in/log-in.module';
import { GoogleSignModule } from './google-sign/google-sign.module';

@Module({
	imports: [SignUpModule, LogInModule, GoogleSignModule],
})
export class SignModule {}

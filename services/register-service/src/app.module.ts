import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SignModule } from './sign/sign.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		AuthModule,
		SignModule,
		ForgotPasswordModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
})
export class AppModule {}

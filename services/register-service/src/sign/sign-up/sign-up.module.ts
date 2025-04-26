import { Module } from '@nestjs/common';
import { SignUpService } from './sign-up.service';
import { SignUpController } from './sign-up.controller';
import {
	PrismaService,
	RegisterFunctionsService,
	SharedModule,
} from 'omma-shared-lib';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
	controllers: [SignUpController],
	providers: [SignUpService, PrismaService, RegisterFunctionsService],
	imports: [
		SharedModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
})
export class SignUpModule {}

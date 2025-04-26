import { Module } from '@nestjs/common';
import { GoogleSignService } from './google-sign.service';
import { GoogleSignController } from './google-sign.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
	PrismaService,
	RegisterFunctionsService,
	SharedModule,
} from 'omma-shared-lib';

@Module({
	controllers: [GoogleSignController],
	providers: [
		GoogleSignService,
		GoogleStrategy,
		PrismaService,
		RegisterFunctionsService,
	],
	imports: [
		SharedModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
})
export class GoogleSignModule {}

import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshTokensController } from './refresh-tokens.controller';
import {
	PrismaService,
	RegisterFunctionsService,
	SharedModule,
} from 'omma-shared-lib';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
	controllers: [RefreshTokensController],
	providers: [RefreshTokensService, PrismaService, RegisterFunctionsService],
	imports: [
		SharedModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
})
export class RefreshTokensModule {}

import { Module } from '@nestjs/common';
import { LogInService } from './log-in.service';
import { LogInController } from './log-in.controller';
import {
	PrismaService,
	RegisterFunctionsService,
	SharedModule,
} from 'omma-shared-lib';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
	controllers: [LogInController],
	providers: [LogInService, PrismaService, RegisterFunctionsService],
	imports: [
		SharedModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
})
export class LogInModule {}

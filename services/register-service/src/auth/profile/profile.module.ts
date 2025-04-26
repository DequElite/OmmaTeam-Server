import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import {
	PrismaService,
	RegisterFunctionsService,
	SharedModule,
} from 'omma-shared-lib';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, PrismaService, RegisterFunctionsService],
	imports: [
		SharedModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
})
export class ProfileModule {}

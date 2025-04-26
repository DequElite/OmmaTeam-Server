import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';

@Module({
	imports: [ProfileModule, RefreshTokensModule],
})
export class AuthModule {}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
			callbackURL: process.env.CALLBACK_URL_DEV || '',
			scope: ['email', 'profile'],
		});
	}

	public async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<any> {
		const email = profile.emails ? profile.emails[0].value : '';
		const username =
			profile.username || profile.displayName || email.split('@')[0];

		const user = {
			email: email,
			username: username,
		};

		done(null, user);
	}
}

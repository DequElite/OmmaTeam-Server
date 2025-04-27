import { IsEmail } from 'class-validator';

export class SendResetPasswordKeyDTO {
	@IsEmail()
	// eslint-disable-next-line indent
	email: string;
}

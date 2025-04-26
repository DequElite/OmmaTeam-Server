import { IsEmail } from 'class-validator';

export class SendResetPasswordKeyDTO {
	@IsEmail()
	email: string;
}

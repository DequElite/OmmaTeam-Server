import { IsStrongPassword, IsString } from 'class-validator';

export class ResetPasswordDTO {
	@IsStrongPassword()
	// eslint-disable-next-line indent
	password: string;

	@IsString()
	// eslint-disable-next-line indent
	resetToken: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword, IsString } from 'class-validator';

export class ResetPasswordDTO {
	@ApiProperty({
		description: 'User account password',
	})
	@IsStrongPassword()
	// eslint-disable-next-line indent
	password: string;

	@ApiProperty({
		example: 'From client query param',
		description: 'Reset password token',
	})
	@IsString()
	// eslint-disable-next-line indent
	resetToken: string;
}

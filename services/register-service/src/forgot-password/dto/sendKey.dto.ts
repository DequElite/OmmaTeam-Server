import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendResetPasswordKeyDTO {
	@ApiProperty({ example: 'user@example.com', description: 'User email' })
	@IsEmail()
	// eslint-disable-next-line indent
	email: string;
}

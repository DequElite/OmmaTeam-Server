import { IsEmail, IsUUID } from 'class-validator';

export class getUserTeamsDataDto {
	@IsEmail()
	// eslint-disable-next-line indent
	email: string;
}

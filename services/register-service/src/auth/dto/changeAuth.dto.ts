import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsString,
	IsStrongPassword,
	MaxLength,
} from 'class-validator';

export class ChangeProfileDto {
	@ApiProperty({ example: 'dequelite', description: 'User name to change' })
	@IsString({
		message: 'Username must be a string',
	})
	@MaxLength(25, {
		message: 'The username length should not exceed 25 characters',
	})
	username: string;

	@ApiProperty({
		example: 'dequelite@gmail.com',
		description: 'User email to change',
	})
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'oldPAssword', description: 'Old user password' })
	@IsString()
	oldPassword: string;

	@ApiProperty({ example: 'newpaswword', description: 'New user password' })
	@IsStrongPassword()
	password: string;
}

export type TPasswordChangeDto = Partial<
	Pick<ChangeProfileDto, 'email' | 'username'>
> &
	Required<Omit<ChangeProfileDto, 'email' | 'username'>>;

export type TPartialChange = Partial<
	Omit<ChangeProfileDto, 'oldPassword' | 'password'>
>;

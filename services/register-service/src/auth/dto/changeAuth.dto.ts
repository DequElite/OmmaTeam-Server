import {
	IsEmail,
	IsString,
	IsStrongPassword,
	MaxLength,
} from 'class-validator';

export class ChangeProfileDto {
	@IsString({
		message: 'Username must be a string',
	})
	@MaxLength(25, {
		message: 'The username length should not exceed 25 characters',
	})
	username: string;

	@IsEmail()
		email: string;

	@IsString()
		oldPassword: string;

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

import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsEnum,
	IsString,
	IsStrongPassword,
	MaxLength,
} from 'class-validator';

export enum UsersRoles {
	User = 'USER',
	Admin = 'ADMIN',
}

export class SignDto {
	@ApiProperty({ example: 'user@example.com', description: 'User email' })
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'dequelite', description: 'User name' })
	@IsString({
		message: 'Username must be a string',
	})
	@MaxLength(25, {
		message: 'The username length should not exceed 25 characters',
	})
	username: string;

	@ApiProperty({
		example: 'strong65#password!',
		description: 'User account password',
	})
	@IsStrongPassword()
	password?: string;

	@IsEnum(UsersRoles)
	role?: UsersRoles;
}

export type TPartialSignDto = Partial<SignDto>;

export type TEmailAndPasswordRequiredSignDto = Required<
	Pick<SignDto, 'email' | 'password'>
> &
	Partial<Omit<SignDto, 'email' | 'password'>>;

export type TEmailAndUsernameRequiredSignDto = Required<
	Pick<SignDto, 'email' | 'username'>
> &
	Partial<Omit<SignDto, 'email' | 'username'>>;

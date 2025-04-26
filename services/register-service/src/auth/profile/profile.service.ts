import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, RegisterFunctionsService } from 'omma-shared-lib';
import { TPartialChange, TPasswordChangeDto } from '../dto/changeAuth.dto';
import { User } from 'omma-shared-lib/generated/prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly registerFunctions: RegisterFunctionsService,
	) {}

	public async changeUserData(dto: TPartialChange, userData: any) {
		const isUserExist = await this.checkIfUserExist(userData.email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.BAD_REQUEST);
		}

		const user: User = isUserExist.user;

		if (dto.email || dto.username) {
			const resultUser = await this.prisma.user.update({
				where: {
					email: user.email,
				},
				data: {
					email: dto.email ?? user.email,
					username: dto.username ?? user.username,
				},
			});

			const { accessToken, refreshToken } =
				await this.registerFunctions.generateTokens(resultUser);

			await this.registerFunctions.saveRefreshToken(
				resultUser.id,
				refreshToken,
			);

			return {
				message: 'User data successfully updated',
				accessToken,
				refreshToken,
			};
		} else {
			throw new HttpException('MISSING_DATA_FIELDS', HttpStatus.BAD_REQUEST);
		}
	}

	public async changeUserPassword(dto: TPasswordChangeDto, userData: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
		const isUserExist = await this.checkIfUserExist(userData.email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.BAD_REQUEST);
		}

		const user: User = isUserExist.user;

		if (dto.oldPassword !== null && dto.password !== null) {
			const validatePassword = await bcrypt.compare(
				dto.oldPassword,
				user.password,
			);
			if (!validatePassword) {
				throw new HttpException('INVALID_PASSWORD', HttpStatus.UNAUTHORIZED);
			}

			const newHashedPassword = await this.registerFunctions.hashPassword(dto.password);

			await this.prisma.user.update({
				where: {
					email: user.email,
				},
				data: {
					password: newHashedPassword,
				},
			});

			return { message: 'Password updated successfully' };
		} else {
			throw new HttpException(
				'MISSING_PASSWORD_FIELDS',
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	private async checkIfUserExist(email: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				email,
			},
		});

		return {
			user,
			isExist: !!user,
		};
	}
}

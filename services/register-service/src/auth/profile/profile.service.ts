import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, RegisterFunctionsService } from 'omma-shared-lib';
import { TPartialChange, TPasswordChangeDto } from '../dto/changeAuth.dto';
import { User } from 'omma-shared-lib/generated/prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { getUserTeamsDataDto } from '../dto/getUserData.dto';

@Injectable()
export class ProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly registerFunctions: RegisterFunctionsService,
	) {}

	public async logOut(userData: any){
		const isUserExist = await this.checkIfUserExist(userData.email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.NOT_FOUND);
		}

		return await this.prisma.additionalUserData.update({
			where: {
				userId: isUserExist.user.id,
			},
			data: {
				refresh_token: null,
			},
		});
	}

	public async getUserTeamsData(email: string) {
		const isUserExist =
			await this.checkIfUserExistByEmailAndReturnTeamData(email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.NOT_FOUND);
		}

		return {
			message: 'Successfully got team data',
			teams: isUserExist.user.teams,
		};
	}

	public async changeUserData(dto: TPartialChange, userData: any) {
		const isUserExist = await this.checkIfUserExist(userData.email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.NOT_FOUND);
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
			throw new HttpException('USER_NOT_EXIST', HttpStatus.NOT_FOUND);
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

	private async checkIfUserExistByEmailAndReturnTeamData(email: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				email,
			},
			include: {
				teams: {
					select: {
						team: {
							select: {
								id: true,
								name: true,
								leader: {
									select: {
										email: true,
									},
								},
							},
						},
						assigned_tasks: {
							select: {
								id: true,
							},
						},
					},
				},
			},
		});

		return {
			user,
			isExist: !!user,
		};
	}
}

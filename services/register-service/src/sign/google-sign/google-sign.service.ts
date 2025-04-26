import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService, RegisterFunctionsService } from 'omma-shared-lib';
import { SignDto, TEmailAndUsernameRequiredSignDto } from '../dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { User, UsersRoles } from 'omma-shared-lib/generated/prisma';
import * as crypto from 'crypto';

@Injectable()
export class GoogleSignService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly registerFunctions: RegisterFunctionsService,
	) {}

	public async registerUserWithGoogle(
		dto: SignDto | TEmailAndUsernameRequiredSignDto,
	) {
		const isUserExist = await this.checkIfUserExist(dto.email);
		const user = isUserExist.user;

		if (user) {
			if (user.password && dto.password) {
				const isPasswordValid = await bcrypt.compare(
					dto.password,
					user.password,
				);
				if (!isPasswordValid) {
					throw new HttpException('INVALID_PASSWORD', HttpStatus.BAD_REQUEST);
				}
			}

			const { refreshToken, accessToken } =
				await this.registerFunctions.generateTokens(user);

			await this.registerFunctions.saveRefreshToken(user.id, refreshToken);

			return {
				message: 'User successfully logined',
				accessToken,
				refreshToken,
			};
		} else {
			const newUserPassword = crypto.randomBytes(8).toString('hex');
			const HashedPassword =
				await this.registerFunctions.hashPassword(newUserPassword);

			const newUser = await this.createUser(dto, HashedPassword);

			const { refreshToken, accessToken } =
				await this.registerFunctions.generateTokens(newUser);

			await this.registerFunctions.saveRefreshToken(newUser.id, refreshToken);

			return {
				message: 'User successfully registered',
				accessToken,
				refreshToken,
			};
		}
	}

	private async createUser(
		dto: SignDto | TEmailAndUsernameRequiredSignDto,
		hashedPassword: string,
	) {
		return this.prisma.user.create({
			data: {
				email: dto.email,
				username: dto.username || `user_${Date.now()}`,
				password: hashedPassword,
				role: dto.role || UsersRoles.USER,
				additional_data: {
					create: {
						is_email_verified: false,
					},
				},
			},
		});
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

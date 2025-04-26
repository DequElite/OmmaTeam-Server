import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService, RegisterFunctionsService } from 'omma-shared-lib';
import { TEmailAndPasswordRequiredSignDto } from '../dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { User, UsersRoles } from 'omma-shared-lib/generated/prisma';

@Injectable()
export class LogInService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly registerFunctions: RegisterFunctionsService,
	) {}

	public async logInUser(dto: TEmailAndPasswordRequiredSignDto) {
		const isUserExist = await this.checkIfUserExist(dto.email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.BAD_REQUEST);
		}

		const user: User = isUserExist.user;

		const isPasswordValid = await bcrypt.compare(dto.password, user.password);
		if (!isPasswordValid) {
			throw new HttpException('INVALID_PASSWORD', HttpStatus.BAD_REQUEST);
		}

		const { refreshToken, accessToken } =
			await this.registerFunctions.generateTokens(user);

		await this.registerFunctions.saveRefreshToken(user.id, refreshToken);

		return {
			message: 'User successfully logined',
			accessToken,
			refreshToken,
		};
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

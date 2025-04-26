import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService, RegisterFunctionsService } from 'omma-shared-lib';
import { User } from 'omma-shared-lib/generated/prisma';

@Injectable()
export class RefreshTokensService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly registerFunctions: RegisterFunctionsService,
	) {}

	public async refreshTokens(refreshToken: string) {
		if (!refreshToken) {
			throw new HttpException(
				'REFRESH_TOKEN_NOT_EXIST',
				HttpStatus.UNAUTHORIZED,
			);
		}

		const decodedToken: any = this.jwt.verify(refreshToken, {
			secret: process.env.JWT_SECRET,
		});

		const isUserExist = await this.checkIfUserExist(decodedToken.email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.BAD_REQUEST);
		}

		const user: User = isUserExist.user;

		const accessToken = this.jwt.sign(
			{
				username: user.username,
				email: user.email,
				role: user.role,
			},
			{
				secret: process.env.JWT_SECRET,
				expiresIn: '1h',
			},
		);

		return {
			message: 'Accrss token created successfully',
			accessToken: accessToken,
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

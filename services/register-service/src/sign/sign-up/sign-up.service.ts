import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, RegisterFunctionsService } from 'omma-shared-lib';
import { SignDto } from '../dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersRoles } from 'omma-shared-lib/generated/prisma';

@Injectable()
export class SignUpService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly registerFunctions: RegisterFunctionsService,
	) {}

	public async returnAllUsers() {
		return await this.prisma.user.findMany({
			include: {
				additional_data: true,
			},
		});
	}

	public async registerUser(dto: SignDto) {
		const isUserExist = await this.registerFunctions.checkIfUserExist(
			dto.username,
			dto.email,
		);
		if (isUserExist) {
			throw new HttpException('USER_ALREADY_EXIST', HttpStatus.BAD_REQUEST);
		}

		const HashedPassword = await this.registerFunctions.hashPassword(
			dto.password,
		);

		const newUser = await this.createUser(dto, HashedPassword);

		const { refreshToken, accessToken } =
			await this.registerFunctions.generateTokens(dto);

		await this.registerFunctions.saveRefreshToken(newUser.id, refreshToken);

		return {
			message: 'User successfully registered',
			accessToken,
			refreshToken,
		};
	}

	private async createUser(dto: SignDto, hashedPassword: string) {
		return this.prisma.user.create({
			data: {
				email: dto.email,
				username: dto.username,
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
}

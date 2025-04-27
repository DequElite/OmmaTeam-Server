import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, RegisterFunctionsService } from 'omma-shared-lib';
import { ResetPasswordDTO } from '../dto/resetPassword.dto';

@Injectable()
export class ResetPasswordService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly registerFunctions: RegisterFunctionsService,
	) {}

	public async resetPassword(dto: ResetPasswordDTO) {
		const isTokenExist = await this.checkIfTokenExist(dto.resetToken);
		if (!isTokenExist.isExist) {
			throw new HttpException('TOKEN_NOT_EXIST', HttpStatus.NOT_FOUND);
		}

		const isResetTokenExpired = this.isTokenExpired(
			isTokenExist.tokenExpiredAt || new Date(),
		);

		if (isResetTokenExpired) {
			throw new HttpException('TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
		}

		await this.saveResetTokensData(null, null, isTokenExist.userId || '');

		const hashedNewPassword = await this.registerFunctions.hashPassword(
			dto.password,
		);

		await this.saveNewUserPassword(
			hashedNewPassword,
			isTokenExist.userId || '',
		);

		return {
			message: 'Password reset successfully',
		};
	}

	private async saveNewUserPassword(hashedNewPassword: string, userId: string) {
		return await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				password: hashedNewPassword,
			},
		});
	}

	private async saveResetTokensData(
		resetToken: string | null,
		resedTokenExpireAt: Date | null,
		userId: string,
	) {
		return await this.prisma.additionalUserData.update({
			where: {
				userId,
			},
			data: {
				password_reset_token: resetToken,
				password_reset_expires_at: resedTokenExpireAt,
			},
		});
	}

	private async checkIfTokenExist(resetToken: string) {
		const token = await this.prisma.additionalUserData.findUnique({
			where: {
				password_reset_token: resetToken,
			},
		});

		return {
			tokenExpiredAt: token?.password_reset_expires_at,
			isExist: !!token,
			userId: token?.userId,
		};
	}

	private isTokenExpired(tokenExpiredAt: Date): boolean {
		const now = new Date();

		if (now > tokenExpiredAt) {
			return true;
		}

		return false;
	}
}

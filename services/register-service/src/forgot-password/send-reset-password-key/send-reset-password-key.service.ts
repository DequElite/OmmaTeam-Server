import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService, PrismaService } from 'omma-shared-lib';
import { SendResetPasswordKeyDTO } from '../dto/sendKey.dto';
import { User } from 'omma-shared-lib/generated/prisma';
import * as crypto from 'crypto';
import emailResetPassword from './emailResetPassword.template';

@Injectable()
export class SendResetPasswordKeyService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mail: MailService,
	) {}

	public async sendResetKey(dto: SendResetPasswordKeyDTO) {
		const isUserExist = await this.checkIfUserExist(dto.email);
		if (!isUserExist.isExist || !isUserExist.user) {
			throw new HttpException('USER_NOT_EXIST', HttpStatus.NOT_FOUND);
		}

		const user: User = isUserExist.user;

		const { resetToken, resetTokenExpireAt } = this.generateResetTokens();

		await this.saveResetTokensData(resetToken, resetTokenExpireAt, user.id);

		const resetLinkDomain =
			process.env.APP_MODE === 'DEV'
				? process.env.EMAIL_DEV_RESET_LINK
				: process.env.EMAIL_PROD_RESET_LINK;
		const resetLink = `${resetLinkDomain}${resetToken}`;

		const mailResetPasswordTemplate = emailResetPassword(resetLink);

		// return {
		// 	message: 'A password reset email has been sent.',
		// 	resedTokenExpireAt: resetTokenExpireAt,
		// };
		try {
			await this.mail.sendMail(
				dto.email,
				'Password recovery link',
				mailResetPasswordTemplate,
			);

			return {
				message: 'A password reset email has been sent.',
			};
		} catch (err) {
			await this.saveResetTokensData(null, null, user.id);

			console.error('Error while sending email: ', err);

			throw new HttpException(
				'EMAIL_SENDING_FAILED',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
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

	private generateResetTokens() {
		const resetToken = crypto.randomBytes(32).toString('hex');
		const resetTokenExpireAt = new Date(Date.now() + 15 * 60 * 1000);

		return {
			resetToken,
			resetTokenExpireAt,
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

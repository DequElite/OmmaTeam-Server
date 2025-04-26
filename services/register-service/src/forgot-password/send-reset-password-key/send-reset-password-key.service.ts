import { Injectable } from '@nestjs/common';
import { MailService, PrismaService } from 'omma-shared-lib';
import { SendResetPasswordKeyDTO } from '../dto/sendKey.dto';

@Injectable()
export class SendResetPasswordKeyService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mail: MailService,
	) {}

	public async sendResetKey(dto: SendResetPasswordKeyDTO) {}

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

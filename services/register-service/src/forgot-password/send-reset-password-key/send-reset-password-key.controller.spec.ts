import { Test, TestingModule } from '@nestjs/testing';
import { SendResetPasswordKeyController } from './send-reset-password-key.controller';
import { SendResetPasswordKeyService } from './send-reset-password-key.service';

describe('SendResetPasswordKeyController', () => {
	let controller: SendResetPasswordKeyController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [SendResetPasswordKeyController],
			providers: [SendResetPasswordKeyService],
		}).compile();

		controller = module.get<SendResetPasswordKeyController>(
			SendResetPasswordKeyController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});

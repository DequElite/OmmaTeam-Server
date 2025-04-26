import { Test, TestingModule } from '@nestjs/testing';
import { SendResetPasswordKeyService } from './send-reset-password-key.service';

describe('SendResetPasswordKeyService', () => {
	let service: SendResetPasswordKeyService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SendResetPasswordKeyService],
		}).compile();

		service = module.get<SendResetPasswordKeyService>(
			SendResetPasswordKeyService,
		);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});

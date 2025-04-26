import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSignController } from './google-sign.controller';
import { GoogleSignService } from './google-sign.service';

describe('GoogleSignController', () => {
	let controller: GoogleSignController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GoogleSignController],
			providers: [GoogleSignService],
		}).compile();

		controller = module.get<GoogleSignController>(GoogleSignController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});

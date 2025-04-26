import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSignService } from './google-sign.service';

describe('GoogleSignService', () => {
	let service: GoogleSignService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [GoogleSignService],
		}).compile();

		service = module.get<GoogleSignService>(GoogleSignService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});

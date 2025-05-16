import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

const mockProfileService = {
	getProfileData: jest.fn(),
	changeUserPassword: jest.fn(),
	changeUserData: jest.fn(),
};

describe('ProfileController', () => {
	let controller: ProfileController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ProfileController],
			providers: [
				{
					provide: ProfileService,
					useValue: mockProfileService,
				},
			],
		}).compile();

		controller = module.get<ProfileController>(ProfileController);
	});

	it('should return user data', () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const mockRequest = {
			user: { username: 'dequelite', email: 'test@example.com', role: 'USER' },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const result = controller.getProfileData(mockRequest);
		expect(result).toEqual({
			message: 'access granted',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			user: mockRequest.user,
		});
	});
});

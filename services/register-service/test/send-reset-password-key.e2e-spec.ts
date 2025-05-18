import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService, PrismaService } from 'omma-shared-lib';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import {
	clearTestingUserData,
	createTestingUser,
	TestingUsersTypes,
} from './utils/userTestingData.util';
import { GoogleStrategy } from '../src/sign/google-sign/google.strategy';

describe('send-reset-password-key controller (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	const testingUser: TestingUsersTypes = {
		username: 'dequeliteTesterSRPK',
		email: 'dequeliteTesterSRPK@gmail.com',
	};

	const mailServiceMock = {
		sendMail: jest.fn().mockResolvedValue(true),
	};

	beforeAll(async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
		require('dotenv').config({ path: '.env.test' });

		const moduleMixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(MailService)
			.useValue(mailServiceMock)
			.overrideProvider(GoogleStrategy)
			.useValue({})
			.compile();

		app = moduleMixture.createNestApplication();

		await app.init();

		prisma = app.get(PrismaService);

		await clearTestingUserData(testingUser.email, '', prisma);

		await createTestingUser(testingUser.email, testingUser.username, prisma);
	});

	it('/api/forgot-password/send-reset-password-key (POST) - 200', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/forgot-password/send-reset-password-key')
			.send({
				email: testingUser.email,
			})
			.expect(200);

		expect(mailServiceMock.sendMail).toHaveBeenCalledTimes(1);
		expect(mailServiceMock.sendMail).toHaveBeenCalledWith(
			testingUser.email,
			expect.any(String),
			expect.any(String),
		);

		const user = await prisma.user.findUnique({
			where: {
				email: testingUser.email,
			},
			include: {
				additional_data: true,
			},
		});

		expect(user?.additional_data?.password_reset_token).toBeTruthy();
		expect(user?.additional_data?.password_reset_expires_at).toBeInstanceOf(
			Date,
		);
	});

	it('/api/forgot-password/send-reset-password-key (POST) - 404', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/forgot-password/send-reset-password-key')
			.send({
				email: 'not exist user',
			})
			.expect(404);
	});

	afterAll(async () => {
		await clearTestingUserData(testingUser.email, '', prisma);
		await app.close();
	});
});

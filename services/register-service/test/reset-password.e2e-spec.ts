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

describe('reset-password controller (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	const testingUser: TestingUsersTypes = {
		username: 'dequeliteTesterSRPKf',
		email: 'dequeliteTesterSRPKf@gmail.com',
	};

	const testingUserPassword = 'testing-strong-password';

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

		await createTestingUser(
			testingUser.email,
			testingUser.username,
			prisma,
			testingUserPassword,
		);
	});

	it('/api/forgot-password/reset-password (POST) - 200', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/forgot-password/send-reset-password-key')
			.send({
				email: testingUser.email,
			})
			.expect(200);

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

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer())
			.post('/forgot-password/reset-password')
			.send({
				password: 'newPassword',
				resetToken: user?.additional_data?.password_reset_token,
			})
			.expect(200);

		expect(res.body).toEqual({ message: 'Password reset successfully' });

		const updatedUserData = await prisma.user.findUnique({
			where: {
				email: testingUser.email,
			},
			include: {
				additional_data: true,
			},
		});

		expect(updatedUserData?.additional_data?.password_reset_token).toBeNull();
	});

	it('/api/forgot-password/reset-password (POST) - 404', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/forgot-password/reset-password')
			.send({
				password: 'newPassword',
				resetToken: 'bad reset token',
			})
			.expect(404);
	});

	it('/api/forgot-password/reset-password (POST) - 401', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/forgot-password/send-reset-password-key')
			.send({
				email: testingUser.email,
			})
			.expect(200);

		await prisma.user.update({
			where: { email: testingUser.email },
			data: {
				additional_data: {
					update: {
						password_reset_expires_at: new Date(Date.now() - 60 * 1000), // 1 минута назад
					},
				},
			},
		});

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

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/forgot-password/reset-password')
			.send({
				password: 'newPassword',
				resetToken: user?.additional_data?.password_reset_token,
			})
			.expect(401);
	});

	afterAll(async () => {
		await clearTestingUserData(testingUser.email, '', prisma);
		await app.close();
	});
});

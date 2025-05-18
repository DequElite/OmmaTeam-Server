import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'omma-shared-lib';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GoogleStrategy } from '../src/sign/google-sign/google.strategy';
import {
	clearTestingUserData,
	createTestingUser,
	TestingUsersTypes,
} from './utils/userTestingData.util';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

describe('LogInController (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	const testingUser: TestingUsersTypes = {
		username: 'dequeliteTestLIC',
		email: 'dequeliteTestLIC@gmail.com',
	};

	const testingUserPassword = 'testing-strong-password';

	beforeAll(async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports
		require('dotenv').config({ path: '.env.test' });

		const moduleMixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(GoogleStrategy)
			.useValue({})
			.compile();

		app = moduleMixture.createNestApplication();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		app.use(cookieParser());
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

	it('/sign/log-in (POST) - 200', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const response = await request(app.getHttpServer())
			.post('/sign/log-in')
			.send({
				email: testingUser.email,
				username: testingUser.username,
				password: testingUserPassword,
			})
			.expect(200);

		expect(response.body).toHaveProperty('accessToken');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(response.body.message).toBe('User successfully logined');

		const cookies = response.headers['set-cookie'];
		expect(cookies).toBeDefined();

		const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];

		expect(
			cookiesArray.some((cookie: string) => cookie.startsWith('refreshToken=')),
		).toBe(true);
	});

	it('/sign/log-in (POST) - 404', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/sign/log-in')
			.send({
				email: 'not existing email',
				username: 'not existing username',
				password: testingUserPassword,
			})
			.expect(404);
	});

	it('/sign/log-in (POST) - 401', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/sign/log-in')
			.send({
				email: testingUser.email,
				username: testingUser.username,
				password: 'notExistingPassword',
			})
			.expect(401);
	});

	afterAll(async () => {
		await clearTestingUserData(testingUser.email, '', prisma);
		await app.close();
	});
});

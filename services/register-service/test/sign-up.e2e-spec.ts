import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'omma-shared-lib';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GoogleStrategy } from '../src/sign/google-sign/google.strategy';
import {
	clearTestingUserData,
	TestingUsersTypes,
} from './utils/userTestingData.util';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

describe('SignUpController (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	const testingUser: TestingUsersTypes = {
		username: 'dequeliteTestSUC',
		email: 'dequeliteTestSUC@gmail.com',
	};

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
	});

	it('/sign/sign-up (POST) - 201', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const response = await request(app.getHttpServer())
			.post('/sign/sign-up')
			.send({
				email: testingUser.email,
				username: testingUser.username,
				password: 'strongPassword',
			})
			.expect(201);

		expect(response.body).toHaveProperty('accessToken');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(response.body.message).toBe('User successfully registered');

		const cookies = response.headers['set-cookie'];
		expect(cookies).toBeDefined();

		const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];

		expect(
			cookiesArray.some((cookie: string) => cookie.startsWith('refreshToken=')),
		).toBe(true);
	});

	it('/sign/sign-up (POST) - 400', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.post('/sign/sign-up')
			.send({
				email: testingUser.email,
				username: testingUser.username,
				password: 'strongPassword',
			})
			.expect(400);
	});

	afterAll(async () => {
		await clearTestingUserData(testingUser.email, '', prisma);
		await app.close();
	});
});

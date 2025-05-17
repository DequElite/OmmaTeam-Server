import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

describe('PorfileController (e2e)', () => {
	let app: INestApplication;
	let jwtService: JwtService;
	let prisma: PrismaService;
	let token: string;
	let userData: TestingUsersTypes;

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
		jwtService = app.get(JwtService);

		await clearTestingUserData('testuser2@gmail.com', '', prisma);

		userData = await createTestingUser(
			'testuser2@gmail.com',
			'dequeliteTester2',
			prisma,
		);

		token = jwtService.sign(
			{
				id: userData.id,
			},
			{
				secret: process.env.JWT_SECRET,
				expiresIn: '1h',
			},
		);

		await prisma.additionalUserData.update({
			where: {
				userId: userData.id,
			},
			data: {
				refresh_token: token,
			},
		});
	});

	it('/auth/refresh-tokens (GET) - 401', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer()).get('/auth/refresh-tokens').expect(401);
	});

	it('/auth/refresh-tokens (GET) - 200', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const response = await request(app.getHttpServer())
			.get('/auth/refresh-tokens')
			.set('Cookie', [`refreshToken=${token || ''}`])
			.expect(200);

		expect(response.body).toHaveProperty('message');
		expect(response.body).toHaveProperty('accessToken');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(typeof response.body.accessToken).toBe('string');
	});

	afterAll(async () => {
		await clearTestingUserData('testuser2@gmail.com', '', prisma);
		await app.close();
	});
});

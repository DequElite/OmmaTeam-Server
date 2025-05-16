import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'omma-shared-lib';
import { UsersRoles } from 'omma-shared-lib/generated/prisma';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GoogleStrategy } from '../src/sign/google-sign/google.strategy';
import * as bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

describe('PorfileController (e2e)', () => {
	let app: INestApplication;
	let jwtService: JwtService;
	let prisma: PrismaService;
	let token: string;

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

		const hashedPassword = await bcrypt.hash('hashed-password', 10);

		await prisma.additionalUserData.deleteMany({
			where: {
				user: {
					email: 'testuser2@gmail.com',
				},
			},
		});

		await prisma.user.deleteMany({
			where: {
				email: 'testuser2@gmail.com',
			},
		});
		const user = await prisma.user.create({
			data: {
				email: 'testuser2@gmail.com',
				username: 'dequeliteTester2',
				password: hashedPassword,
				role: UsersRoles.USER,
				additional_data: {
					create: {
						is_email_verified: false,
					},
				},
			},
		});

		token = jwtService.sign(
			{
				id: user.id,
			},
			{
				secret: process.env.JWT_SECRET,
				expiresIn: '1h',
			},
		);

		await prisma.additionalUserData.update({
			where: {
				userId: user.id,
			},
			data: {
				refresh_token: token,
			},
		});
	});

	it('/auth/refresh-tokens (GET) - 401s', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer()).get('/auth/refresh-tokens').expect(401);
	});

    it('/auth/refresh-tokens (GET) - 200', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const response = await request(app.getHttpServer())
			.get('/auth/refresh-tokens')
			.set('Cookie', [`refreshToken=${token}`])
			.expect(200);

		expect(response.body).toHaveProperty('message');
		expect(response.body).toHaveProperty('accessToken');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		expect(typeof response.body.accessToken).toBe('string');
	});

	afterAll(async () => {
		await prisma.additionalUserData.deleteMany({
			where: {
				user: {
					email: 'testuser2@gmail.com',
				},
			},
		});
		await prisma.user.deleteMany({
			where: {
				email: 'testuser2@gmail.com',
			},
		});
		await app.close();
	});
});


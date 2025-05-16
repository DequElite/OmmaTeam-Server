import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'omma-shared-lib';
import { UsersRoles } from 'omma-shared-lib/generated/prisma';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GoogleStrategy } from '../src/sign/google-sign/google.strategy';
import * as bcrypt from 'bcrypt';

describe('PorfileController (e2e)', () => {
	let app: INestApplication;
	let jwtService: JwtService;
	let prisma: PrismaService;
	let token: string;

	const newUsername = 'dequeliteTesterUpdated';
	const newEmail = 'updateduser@gmail.com';

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
		await app.init();

		prisma = app.get(PrismaService);
		jwtService = app.get(JwtService);

		const hashedPassword = await bcrypt.hash('hashed-password', 10);

		await prisma.additionalUserData.deleteMany({
			where: {
				OR: [
					{ user: { email: 'testuser@gmail.com' } },
					{ user: { email: newEmail } },
				],
			},
		});

		await prisma.user.deleteMany({
			where: {
				OR: [{ email: 'testuser@gmail.com' }, { email: newEmail }],
			},
		});

		await prisma.user.create({
			data: {
				email: 'testuser@gmail.com',
				username: 'dequeliteTester',
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
				email: 'testuser@gmail.com',
				username: 'dequeliteTester',
				role: UsersRoles.USER,
			},
			{
				secret: process.env.JWT_SECRET,
				expiresIn: '1h',
			},
		);
	});

	it('/auth/profile (GET) - 200 + user data', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer())
			.get('/auth/profile')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);

		expect(res.body).toEqual({
			message: 'access granted',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			user: expect.objectContaining({
				email: 'testuser@gmail.com',
				username: 'dequeliteTester',
				role: 'USER',
			}),
		});
	});

	it('/auth/profile/change-password (POST) - 200 + message', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const res = await request(app.getHttpServer())
			.patch('/auth/profile/change-password')
			.set('Authorization', `Bearer ${token}`)
			.send({
				oldPassword: 'hashed-password',
				newPassword: 'newStrongPassword',
			})
			.expect(200);

		expect(res.body).toEqual({
			message: 'Password updated successfully',
		});
	});

	it('/auth/profile/change-password (POST) - 401 + message', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.patch('/auth/profile/change-password')
			.set('Authorization', `Bearer ${token}`)
			.send({
				oldPassword: 'hashed-passwordNot',
				newPassword: 'newStrongPassword',
			})
			.expect(401);
	});

	it('/auth/profile/change-profile (POST) - 200', async () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		await request(app.getHttpServer())
			.patch('/auth/profile/change-profile')
			.set('Authorization', `Bearer ${token}`)
			.send({
				username: newUsername,
				email: newEmail,
			})
			.expect(200);

		const updatedUser = await prisma.user.findUnique({
			where: { email: newEmail },
		});
		expect(updatedUser).toBeDefined();
		expect(updatedUser?.username).toBe(newUsername);
	});

	afterAll(async () => {
		await prisma.additionalUserData.deleteMany({
			where: {
				OR: [
					{ user: { email: 'testuser@gmail.com' } },
					{ user: { email: newEmail } },
				],
			},
		});

		await prisma.user.deleteMany({
			where: {
				OR: [{ email: 'testuser@gmail.com' }, { email: newEmail }],
			},
		});
		await app.close();
	});
});

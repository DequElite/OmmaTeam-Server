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
import { UsersRoles } from 'omma-shared-lib/generated/prisma';

describe('PorfileController (e2e)', () => {
	let app: INestApplication;
	let jwtService: JwtService;
	let prisma: PrismaService;
	let token: string;

	const newUsername = 'dequeliteTesterUpdated';
	const newEmail = 'updateduser@gmail.com';

	const testingUser: TestingUsersTypes = {
		username: 'dequeliteTester',
		email: 'testuser@gmail.com',
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
		await app.init();

		prisma = app.get(PrismaService);
		jwtService = app.get(JwtService);

		await clearTestingUserData('testuser@gmail.com', newEmail, prisma);

		await createTestingUser(
			testingUser.email,
			testingUser.username,
			prisma,
			testingUserPassword,
		);

		token = jwtService.sign(
			{
				email: testingUser.email,
				username: testingUser.username,
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
				email: testingUser.email,
				username: testingUser.username,
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
				oldPassword: testingUserPassword,
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
		await clearTestingUserData(testingUser.email, newEmail, prisma);
		await app.close();
	});
});

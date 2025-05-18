import { PrismaService } from 'omma-shared-lib';
import * as bcrypt from 'bcrypt';
import { UsersRoles } from 'omma-shared-lib/generated/prisma';

export interface TestingUsersTypes {
	username: string;
	email: string;
	id?: string;
}

const testingUsers = new Map<string, TestingUsersTypes>();

export async function clearTestingUserData(
	primaryEmail: string,
	secondEmail: string,
	prisma: PrismaService,
) {
	await prisma.additionalUserData.deleteMany({
		where: {
			OR: [{ user: { email: primaryEmail } }, { user: { email: secondEmail } }],
		},
	});

	await prisma.user.deleteMany({
		where: {
			OR: [{ email: primaryEmail }, { email: secondEmail }],
		},
	});

	testingUsers.clear();
}

export async function createTestingUser(
	email: string,
	username: string,
	prisma: PrismaService,
	password: string = 'hashed-password',
) {
	if (testingUsers.has(email)) {
		throw new Error(`User with email "${email}" already exists`);
	}

	const existingUser = await prisma.user.findUnique({
		where: { email },
	});

	if (existingUser) {
		throw new Error(`User with email "${email}" already exists`);
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			email: email,
			username: username,
			password: hashedPassword,
			role: UsersRoles.USER,
			additional_data: {
				create: {
					is_email_verified: false,
				},
			},
		},
	});

	// await prisma.additionalUserData.update({
	// 	where: {
	// 		userId: user.id,
	// 	},
	// 	data: {
	// 		refresh_token: token,
	// 	},
	// });

	const userData: TestingUsersTypes = {
		email,
		username,
		id: user.id,
	};

	testingUsers.set(email, userData);

	return userData;
}

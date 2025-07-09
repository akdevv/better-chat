import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RegisterUserProps = {
	email: string;
	password: string;
	name: string;
};

export const registerUser = async (data: RegisterUserProps) => {
	try {
		const { name, email, password } = data;

		// validate fields
		if (!name || !email || !password) {
			throw new Error("Missing required fields!");
		}

		// check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});
		if (existingUser) {
			throw new Error("User already exists!");
		}

		// hash password
		const hashedPassword = await hash(password, 10);

		// create user
		const user = await db.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		return user;
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "An error occurred!",
		);
	}
};

export async function authenticateUser() {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized", userId: null };
	}
	return { error: null, userId: session.user.id };
}

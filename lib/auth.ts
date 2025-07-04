import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import { db } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const { email, password } = credentials as {
					email: string;
					password: string;
				};
				if (!email || !password) return null;

				// check if user exists
				const user = await db.user.findUnique({ where: { email } });
				if (!user) return null;

				// check if password is correct
				const passwordsMatch = await bcrypt.compare(
					password,
					user.password || ""
				);
				if (!passwordsMatch) return null;

				return user;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
	session: { strategy: "jwt" },
	secret: process.env.NEXTAUTH_SECRET,
});

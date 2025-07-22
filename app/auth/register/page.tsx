"use client";

import Link from "next/link";
import { z } from "zod";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/lib/services/auth";

import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { MdErrorOutline } from "react-icons/md";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import AuthSeparator from "@/components/auth/auth-seprator";

const registerSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" }),
});

export default function RegisterPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(registerSchema) });

	const onSubmit = async (data: {
		name: string;
		email: string;
		password: string;
	}) => {
		const { name, email, password } = data;
		if (!name || !email || !password) {
			toast.error("Please fill in all fields");
			return;
		}

		try {
			setError(null);
			setIsPending(true);

			await registerUser(data);
			toast.success("Account created successfully");

			// sign in user
			const signInResult = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (signInResult?.error) {
				router.push("/chat");
			} else {
				setError(
					"Account created but failed to sign in. Please try logging in.",
				);
				toast.error(
					"Account created but failed to sign in. Please try logging in.",
				);
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An error occurred!";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-md">
			<div className="text-center md:text-left mb-8">
				<h1 className="text-3xl md:text-4xl font-bold mb-2">
					Create an account
				</h1>
				<p className="text-muted-foreground">
					Please enter your details to create an account
				</p>
			</div>

			<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
				{/* Error Message */}
				{error && (
					<div className="bg-red-800/30 border border-red-700 text-white p-3 rounded-md flex items-center gap-2">
						<MdErrorOutline className="w-5 h-5" />
						<p className="text-sm">{error}</p>
					</div>
				)}

				{/* Name */}
				<div className="space-y-1">
					<input
						{...register("name")}
						type="text"
						placeholder="Name"
						disabled={isPending}
						className="w-full border border-border p-3 rounded-md focus:outline-none focus:none focus:ring-transparent"
					/>
					{errors.name && (
						<p className="text-red-700 text-xs">{errors.name.message}</p>
					)}
				</div>

				{/* Email */}
				<div className="space-y-1">
					<input
						{...register("email")}
						type="email"
						placeholder="Email"
						disabled={isPending}
						className="w-full border border-border p-3 rounded-md focus:outline-none focus:none focus:ring-transparent"
					/>
					{errors.email && (
						<p className="text-red-700 text-xs">{errors.email.message}</p>
					)}
				</div>

				{/* Password */}
				<div className="space-y-1">
					<div className="w-full flex items-center justify-between border border-border gap-2 rounded-md focus:outline-none focus:none focus:ring-transparent">
						<input
							{...register("password")}
							type={showPassword ? "text" : "password"}
							placeholder="Password"
							disabled={isPending}
							className={cn(
								"w-full p-3 focus:outline-none focus:none focus:ring-transparent",
								errors.password && "border-red-700",
							)}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="text-muted-foreground cursor-pointer p-3"
						>
							{showPassword ? (
								<LuEyeClosed className="w-5 h-5" />
							) : (
								<LuEye className="w-5 h-5" />
							)}
						</button>
					</div>
					{errors.password && (
						<p className="text-red-700 text-xs">{errors.password.message}</p>
					)}
				</div>

				{/* Register Button */}
				<Button
					type="submit"
					disabled={isPending}
					className="w-full py-6 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
				>
					{isPending ? "Creating account..." : "Create account"}
				</Button>

				<AuthSeparator text="Or continue with" />

				{/* Social Login Buttons */}
				<div className="flex items-center justify-center space-x-4">
					<Button
						type="button"
						className="w-full py-5 bg-secondary/30 text-secondary-foreground border border-secondary hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 cursor-pointer"
					>
						<FaGoogle className="w-5 h-5" /> Continue with Google
					</Button>
				</div>

				{/* Register Link */}
				<div className="text-center mt-6">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href={`/auth/login`} className="text-primary hover:underline">
							Login
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import AuthSeparator from "@/components/auth/auth-seprator";

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(loginSchema) });

	const onSubmit = async (data: { email: string; password: string }) => {
		setError(null);
		setIsPending(true);

		try {
			const res = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (res?.error) {
				const errorMessage =
					`Error: ${res?.error}` || "Invalid email or password";
				setError(errorMessage);
				toast.error(errorMessage);
			} else {
				router.push("/chat/new");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred!";
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
					Welcome back
				</h1>
				<p className="text-muted-foreground">
					Please enter your details to sign in
				</p>
			</div>

			<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
				{/* Email */}
				<div className="space-y-1">
					<input
						{...register("email")}
						type="email"
						placeholder="Email"
						disabled={isPending}
						className={cn(
							"w-full border border-border p-3 rounded-md focus:outline-none focus:none focus:ring-transparent",
							errors.email && "border-2 border-red-700"
						)}
					/>
					{errors.email && (
						<p className="text-red-700 text-xs">
							{errors.email.message}
						</p>
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
								errors.password && "border-red-700"
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
						<p className="text-red-700 text-xs">
							{errors.password.message}
						</p>
					)}
				</div>

				{/* Remember me & Forgot password */}
				<div className="flex justify-end w-full">
					<Link
						href=""
						className="text-sm text-primary hover:underline"
					>
						Forgot password?
					</Link>
				</div>

				{/* Login Button */}
				<Button
					type="submit"
					disabled={isPending}
					className="w-full py-6 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
				>
					{isPending ? "Logging in..." : "Log in"}
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
						Don&apos;t have an account?{" "}
						<Link
							href={`/auth/register`}
							className="text-primary hover:underline"
						>
							Register
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
}

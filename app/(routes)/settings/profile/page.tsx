import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		return redirect("/auth/login");
	}

	return (
		<div className="flex-1 flex-col gap-4 p-6">
			<h1>Profile</h1>
			<p>{session.user.email}</p>
		</div>
	);
}

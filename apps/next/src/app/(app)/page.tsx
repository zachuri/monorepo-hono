"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "~/lib/authClient";

export default function App() {
  const router = useRouter();
	const session = useSession();

	const user = session.data?.user;

	if (!user) {
		return <p>Not logged in</p>;
	}

	const handleSignOut = async () => {
		try {
			await signOut();
			router.push("/");
		} catch (error) {
			console.error("Sign out failed", error);
		}
	};

	return (
		<div>
			<p>Logged in as: {user.id}</p>
			<Button onClick={handleSignOut}>Sign Out</Button>
		</div>
	);
}

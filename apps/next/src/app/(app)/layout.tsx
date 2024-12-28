"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const { loading, user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth/sign-in");
		}
	}, [loading, user, router]);

	if (loading) {
		return (
			<>
				<p>Loading...</p>
			</>
		);
	}

	return <>{children}</>;
}

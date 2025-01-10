"use client";

import { useAuth } from "@repo/app/provider/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const status = useAuth.use.status();
	const token = useAuth.use.token;
	const router = useRouter();

	useEffect(() => {
		if (status === "signOut") {
			router.push("/auth/sign-in");
		}
	}, [status, router]);

	console.log(token);

	return <div>{children}</div>;
}

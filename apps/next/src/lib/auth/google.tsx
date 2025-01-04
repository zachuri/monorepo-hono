"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import { useRouter } from "next/router";

export const GoogleSignIn = () => {
	const { signInWithOAuth } = useAuth();
	const router = useRouter();
	const handleGoogleSignIn = () => {
		void signInWithOAuth({ provider: "google" }).then(user => {
			if (user) {
				void router.push("/");
			}
		});
	};

	return (
		<Button onClick={handleGoogleSignIn}>
			<Image
				alt='Google Logo'
				src={"https://www.cdnlogo.com/logos/g/35/google-icon.svg"}
				width={20}
				height={20}
			/>
			Continue with Google
		</Button>
	);
};

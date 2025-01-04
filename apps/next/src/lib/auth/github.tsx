"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import { useRouter } from "next/router";

export const GithubSignIn = () => {
	const { signInWithOAuth } = useAuth();
	const router = useRouter();
	const handleGithubSignIn = () => {
		void signInWithOAuth({ provider: "github" }).then(user => {
			if (user) {
				void router.push("/");
			}
		});
	};

	return (
		<Button onClick={handleGithubSignIn}>
			<Image
				alt='GitHub Logo'
				src={"https://www.cdnlogo.com/logos/g/69/github-icon.svg"}
				width={20}
				height={20}
			/>
			Continue with GitHub
		</Button>
	);
};

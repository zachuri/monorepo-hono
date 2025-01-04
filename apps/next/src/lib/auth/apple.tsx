"use client";

import { Button } from '@repo/ui/components/ui/button';
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const AppleSignIn = () => {
	const { signInWithOAuth } = useAuth();
	const router = useRouter(); // Us
	const handleAppleSignIn = () => {
		void signInWithOAuth({ provider: "apple" }).then(user => {
			if (user) {
				void router.push("/");
			}
		});
	};

	return (
		<Button onClick={handleAppleSignIn}>
			<Image
				alt='Apple Logo'
				src={"https://www.cdnlogo.com/logos/a/2/apple.svg"}
				width={20}
				height={20}
			/>
			Continue with Apple
		</Button>
	);
};

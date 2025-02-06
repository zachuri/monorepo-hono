"use client";

import { AppleSignIn } from "~/lib/auth/sign-in/AppleSignIn";
import { GithubSignIn } from "~/lib/auth/sign-in/GIthubSignIn";
import { GoogleSignIn } from "~/lib/auth/sign-in/GoogleSignIn";

export default function SignIn() {
	return (
		<div className="flex flex-col items-center flex-1 m-8">
			<div className="flex flex-col gap-12 flex-1 w-full max-w-md">
				<GithubSignIn />
				<GoogleSignIn />
				<AppleSignIn />
			</div>
		</div>
	);
}

"use client";

import { AppleSignIn } from "../../../lib/auth/apple";
import { GithubSignIn } from "../../../lib/auth/github";
import { GoogleSignIn } from "../../../lib/auth/google";

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

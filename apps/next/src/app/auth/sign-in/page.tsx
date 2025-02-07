"use client";

import { Button } from "@repo/ui/components/ui/button";
import { signIn } from "~/lib/authClient";

export default function SignIn() {
	return (
		<div className='flex flex-col items-center flex-1 m-8'>
			<div className='flex flex-col gap-12 flex-1 w-full max-w-md'>
				<Button onClick={() => signIn.social({ provider: "github" })}>
					SignIn
				</Button>
			</div>
		</div>
	);
}

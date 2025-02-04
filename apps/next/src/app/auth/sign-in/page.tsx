"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "~/lib/app.client";
import { supabase } from "~/lib/supabase.client";

function App() {
	const [user, setUser] = useState<null | { id: string }>(null);
	// Check client-side if user is logged in:
	useEffect(() => {
		supabase.auth.onAuthStateChange((event, session) => {
			console.log("Auth event:", event);
			if (event === "SIGNED_OUT") {
				setUser(null);
			} else {
				setUser(session?.user!);
			}
		});
	}, []);

	return (
		<Card>
			<CardContent>
				<h1>Hono Supabase Auth Example!</h1>
				<h2>Sign in</h2>
				{!user ? (
					<SignIn />
				) : (
					<Button
						onClick={() => {
							window.location.href = "/signout";
						}}>
						Sign out!
					</Button>
				)}
				<h2>Example of API fetch()</h2>
				<UserDetailsButton />
				<h2>Example of database read</h2>
				<p>
					Note that only authenticated users are able to read from the database!
				</p>
				<Link href='/countries'>Get countries</Link>
			</CardContent>
		</Card>
	);
}

function SignIn() {
	return (
		<>
			<p>Sign in with your GitHub account to continue.</p>
			<Button
				onClick={async () => {
					const { data, error } = await supabase.auth.signInWithOAuth({
						provider: "github",
					});
					if (error)
						return console.error(
							"Error signing in with GitHub:",
							error.message
						);
					console.log("Signed in with GitHub client-side!");
				}}>
				Sign in with GitHub
			</Button>
		</>
	);
}

const UserDetailsButton = () => {
	const [response, setResponse] = useState<string | null>(null);

	const handleClick = async () => {
		const response = await client.api.user.$get();
		const data = await response.json();
		const headers = Array.from(response.headers.entries()).reduce<
			Record<string, string>
		>((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {});
		const fullResponse = {
			url: response.url,
			status: response.status,
			headers,
			body: data,
		};
		setResponse(JSON.stringify(fullResponse, null, 2));
	};

	return (
		<div>
			<Button onClick={handleClick}>Get My User Details</Button>
			{response && <pre>{response}</pre>}
		</div>
	);
};

export default App;

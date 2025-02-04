"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useState } from "react";
import { client } from "~/lib/app.client";

export default function Page() {
	return <UserDetailsButton />;
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

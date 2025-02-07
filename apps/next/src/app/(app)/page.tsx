"use client";

import { useSession } from "~/lib/authClient";

export default function App() {
	const session = useSession();

	const user = session.data?.user;

	if (user) {
		<p>Not logged in</p>;
	} else {
		return <p>Logged in as: {user}</p>;
	}
}

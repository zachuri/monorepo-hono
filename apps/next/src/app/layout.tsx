"use client";

import "@repo/ui/globals.css";
import { Metadata } from "next";
import { AuthProvider } from "~/lib/auth/AuthProvider";
import { hydrateAuth } from "@repo/app/provider/auth";

hydrateAuth();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<AuthProvider>
				<body>{children}</body>
			</AuthProvider>
		</html>
	);
}

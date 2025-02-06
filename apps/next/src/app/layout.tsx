"use client";

import { hydrateAuth } from "@repo/app/provider/auth";
import "@repo/ui/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "~/lib/auth/AuthProvider";

hydrateAuth();

const queryClient = new QueryClient();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<body>{children}</body>
				</AuthProvider>
			</QueryClientProvider>
		</html>
	);
}

import type { AppType } from "@repo/api/src/index";
import { getItem } from '@repo/app/provider/auth/cookie-store';
import { hc } from "hono/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Function to create the API client with headers
export const createApiClient = () => {
	// Get the token from cookies, provide a default value if not found
	const token = getItem("token") ?? "";

	// Create and return the client with the Authorization header
	return hc<AppType>(API_URL, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

// Usage
export const client = createApiClient();
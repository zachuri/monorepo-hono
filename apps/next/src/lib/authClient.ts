"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	// TODO: update to process.env
	baseURL: "http://localhost:8787", // Ensure this matches your backend server URL
	callbackURL: "http://localhost:3000", // Add your callback URL here
});

export const { signIn, signUp, useSession, signOut } = authClient; // Use the created authClient instance

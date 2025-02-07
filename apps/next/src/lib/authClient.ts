"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "http://localhost:8787", // Ensure this matches your backend server URL
});

export const { signIn, signUp, useSession, signOut } = authClient; // Use the created authClient instance

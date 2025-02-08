"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787", // Use environment variable for backend URL
	callbackURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Use environment variable for frontend URL

});

export const { signIn, signUp, useSession, signOut } = authClient; // Use the created authClient instance

"use client";

import type { InferRequestType, InferResponseType } from "hono/client";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { getItem, removeItem, setItem } from '@repo/app/provider/auth/cookie-store';
import { useRouter } from "next/navigation";
import { client, createApiClient } from "../api.client";
import { User } from "../store/userStore";

type Provider = NonNullable<
	InferRequestType<(typeof client)["auth"]["login"][":provider"]["$post"]>
>["param"]["provider"];

type AuthContextType = {
	user: User | null;
	signOut: () => Promise<void>;
	signInWithIdToken: (args: {
		idToken: string;
		provider: Provider;
		user?: {
			username: string;
		};
	}) => Promise<User | null>;
	signInWithOAuth: (args: {
		provider: Provider;
		redirect?: string;
	}) => Promise<User | null>;
	getOAuthAccounts: () => Promise<
		InferResponseType<
			(typeof client)["user"]["oauth-accounts"]["$get"]
		>["accounts"]
	>;
	loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [loading, setLoading] = useState(true);
	// const { setItem, getItem, deleteItem } = useStore();
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();

	const signInWithOAuth = async ({
		provider,
		redirect = `${window.location.origin}`,
	}: {
		provider: Provider;
		redirect?: string;
	}): Promise<User | null> => {
		const oauthUrl = new URL(
			`${process.env.NEXT_PUBLIC_API_URL!}/auth/${provider}?redirect=${redirect}`
		);

		const token = getItem("token");

		if (token) {
			oauthUrl.searchParams.append("sessionToken", token.toString());
		}

		// const token = await getItem("token");
		// if (token) {
		// 	oauthUrl.searchParams.append("sessionToken", token);
		// }

		// Redirect the current window to the OAuth URL
		window.location.href = oauthUrl.toString();

		// Handle the callback in the same window
		return new Promise<User | null>(resolve => {
			const handleAuthCallback = async () => {
				const urlParams = new URLSearchParams(window.location.search);
				const token = urlParams.get("token");
				if (!token) {
					resolve(null);
					return;
				}

				setItem("token", token);
				createApiClient();
				// Api.addSessionToken(sessionToken);
				const user = await getUser();
				setUser(user);

				// Set session token locally
				// await setItem("token", sessionToken);
				resolve(user);
			};

			// Call the callback handler
			handleAuthCallback();
		});
	};

	const signInWithIdToken = async ({
		idToken,
		provider,
		user: createUser,
	}: {
		idToken: string;
		provider: Provider;
		user?: {
			username: string;
		};
	}): Promise<User | null> => {
		const response = await client.auth.login[":provider"].$post({
			param: { provider },
			json: { idToken, user: createUser },
		});
		if (!response.ok) {
			return null;
		}
		const token = ((await response.json()) as { token: string }).token;
		if (!token) {
			return null;
		}

		const user = await getUser();
		setUser(user);

		// Add session token to cookies
		setItem("token", token);
		return user;
	};

	const getUser = async (): Promise<User | null> => {
		const response = await client.user.$get();
		if (!response.ok) {
			return null;
		}
		const user = await response.json();
		return user;
	};

	const signOut = async () => {
		const response = await client.auth.logout.$post();
		if (!response.ok) {
			return;
		}

		setUser(null);
		removeItem("token");
	};

	const getOAuthAccounts = async () => {
		const response = await client.user["oauth-accounts"].$get();
		if (!response.ok) {
			return [];
		}
		return (await response.json()).accounts;
	};

	useEffect(() => {
		const handleAuthCallback = async () => {
			setLoading(true);
			const urlParams = new URLSearchParams(window.location.search);
			const token = urlParams.get("token");
			if (token) {
				// TOOD: later if adding mobile for local storage add sessionToken
				setItem("token", token);
				createApiClient();
				const user = await getUser();
				setUser(user);
			}
			setLoading(false);
		};

		handleAuthCallback();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				signOut,
				loading,
				signInWithIdToken,
				signInWithOAuth,
				getOAuthAccounts,
			}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { InferRequestType, InferResponseType } from "hono/client";

import useStore from "../store/index";
import useUserStore, { OAuthAccounts, User } from "../store/userStore";
import { useRouter } from "next/navigation";
import { Api } from "../api.client";

type Provider = NonNullable<
	InferRequestType<(typeof Api.client)["auth"]["login"][":provider"]["$post"]>
>["param"]["provider"];

type AuthContextType = {
	user: User | null;
	oAuthAccounts: OAuthAccounts | null;
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
	loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const { getItem, setItem, deleteItem } = useStore();
	const {
		user,
		setUser,
		getUser,
		oAuthAccounts,
		setOAuthAccounts,
		getOAuthAccounts,
	} = useUserStore();

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
		const sessionToken = await getItem("session_token");
		if (sessionToken) {
			oauthUrl.searchParams.append("sessionToken", sessionToken);
		}

		console.log(oauthUrl.toString());

		// Redirect the current window to the OAuth URL
		window.location.href = oauthUrl.toString();

		// Handle the callback in the same window
		return new Promise<User | null>(resolve => {
			const handleAuthCallback = async () => {
				const urlParams = new URLSearchParams(window.location.search);
				const sessionToken = urlParams.get("token");
				if (!sessionToken) {
					resolve(null);
					return;
				}

				Api.addSessionToken(sessionToken);
				const user = await getUser();
				const oAuthAccounts = await getOAuthAccounts();
				setUser(user);
				setOAuthAccounts(oAuthAccounts);
				await setItem("session_token", sessionToken);
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
		const response = await Api.client.auth.login[":provider"].$post({
			param: { provider },
			json: { idToken, user: createUser },
		});
		if (!response.ok) {
			return null;
		}
		const sessionToken = ((await response.json()) as { token: string }).token;
		if (!sessionToken) {
			return null;
		}
		Api.addSessionToken(sessionToken);
		const user = await getUser();
		const oAuthAccounts = await getOAuthAccounts();
		setUser(user);
		setOAuthAccounts(oAuthAccounts);
		await setItem("session_token", sessionToken);
		return user;
	};

	const signOut = async () => {
		const response = await Api.client.auth.logout.$post();
		if (!response.ok) {
			return;
		}
		setUser(null);
		setOAuthAccounts(null);
		await deleteItem("session_token");
	};

	useEffect(() => {
		const handleAuthCallback = async () => {
			setLoading(true);
			const urlParams = new URLSearchParams(window.location.search);
			const sessionToken = urlParams.get("token");
			if (sessionToken) {
				Api.addSessionToken(sessionToken);
				const user = await getUser();
				setUser(user);
				await setItem("session_token", sessionToken);
				router.replace("/");
			}
			setLoading(false);
		};

		handleAuthCallback();
	}, [router]);

	return (
		<AuthContext.Provider
			value={{
				user,
				oAuthAccounts,
				signOut,
				loading,
				signInWithIdToken,
				signInWithOAuth,
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

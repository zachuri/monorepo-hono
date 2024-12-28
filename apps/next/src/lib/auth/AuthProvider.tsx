"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { InferRequestType, InferResponseType } from "hono/client";

import { Api } from "../api.client";
import { useRouter } from "next/navigation";
import useStore from "../store";
import useUserStore from "../store/userStore";

type User = NonNullable<InferResponseType<(typeof Api.client)["user"]["$get"]>>;

type Provider = NonNullable<
	InferRequestType<(typeof Api.client)["auth"]["login"][":provider"]["$post"]>
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
	getOAuthAccounts: () => Promise<
		InferResponseType<
			(typeof Api.client)["user"]["oauth-accounts"]["$get"]
		>["accounts"]
	>;
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
	const { user, setUser, getUser } = useUserStore();

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

		return new Promise<User | null>(resolve => {
			// Open a new window for the OAuth flow
			const oauthWindow = window.open(
				oauthUrl.toString(),
				"_blank",
				"width=500,height=700"
			);

			if (!oauthWindow) {
				console.error("Failed to open OAuth window");
				resolve(null);
				return;
			}

			const interval = setInterval(async () => {
				try {
					if (oauthWindow.closed) {
						clearInterval(interval);
						console.error(
							"OAuth window was closed before completing the flow."
						);
						resolve(null);
						return;
					}

					// Check if the redirect URL contains the token
					const redirectedUrl = oauthWindow.location.href;

					if (redirectedUrl.startsWith(redirect)) {
						clearInterval(interval);
						oauthWindow.close();

						const url = new URL(redirectedUrl);
						const sessionToken = url.searchParams.get("token") ?? null;

						if (!sessionToken) {
							resolve(null);
							return;
						}

						Api.addSessionToken(sessionToken);
						const user = await getUser();
						setUser(user);
						await setItem("session_token", sessionToken);
						resolve(user);
					}
				} catch (error) {
					// Cross-origin errors can happen until the window redirects to the same-origin URL
				}
			}, 500);
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
		setUser(user);
		await setItem("session_token", sessionToken);
		return user;
	};

	const signOut = async () => {
		const response = await Api.client.auth.logout.$post();
		if (!response.ok) {
			return;
		}
		setUser(null);
		await deleteItem("session_token");
	};

	const getOAuthAccounts = async () => {
		const response = await Api.client.user["oauth-accounts"].$get();
		if (!response.ok) {
			return [];
		}
		return (await response.json()).accounts;
		console.log("HIT");
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
				signOut,
				loading,
				signInWithIdToken,
				getOAuthAccounts,
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

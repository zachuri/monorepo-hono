import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { InferRequestType, InferResponseType } from "hono/client";

import { Api } from "../api.client";
import useAuthStore from "../store/authStore";

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
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
	const { getItem, setItem, deleteItem } = useAuthStore();

	const signInWithOAuth = async ({
		provider,
		redirect = `${window.location.origin}/auth/callback`,
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
		window.location.href = oauthUrl.toString();
		return null; // Return null as the function expects a Promise<User | null>
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

	const getUser = async (): Promise<User | null> => {
		const response = await Api.client.user.$get();
		if (!response.ok) {
			return null;
		}
		const user = await response.json();
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
	};

	useEffect(() => {
		const handleAuthCallback = async () => {
			const urlParams = new URLSearchParams(window.location.search);
			const sessionToken = urlParams.get("token");
			if (sessionToken) {
				Api.addSessionToken(sessionToken);
				const user = await getUser();
				setUser(user);
				await setItem("session_token", sessionToken);
				router.replace("/");
			}
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

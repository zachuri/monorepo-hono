import type { InferResponseType } from "hono/client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { client } from "../api.client";

export type User = NonNullable<
	InferResponseType<(typeof client)["user"]["$get"]>
>;
export type OAuthAccounts = NonNullable<
	InferResponseType<
		(typeof client)["user"]["oauth-accounts"]["$get"]
	>["accounts"]
>;

const useUserStore = create(
	persist<{
		user: User | null;
		oAuthAccounts: OAuthAccounts | null;
		setUser: (user: User | null) => void;
		setOAuthAccounts: (accounts: OAuthAccounts | null) => void;
		getUser: () => Promise<User | null>;
		getOAuthAccounts: () => Promise<OAuthAccounts>;
	}>(
		set => ({
			user: null,
			oAuthAccounts: null,
			setUser: (user: User | null) => set({ user }),
			setOAuthAccounts: (accounts: OAuthAccounts | null) =>
				set({ oAuthAccounts: accounts }),
			getUser: async () => {
				try {
					const response = await client.user.$get();
					if (!response.ok) {
						console.error("Failed to fetch user:", response.statusText);
						return null;
					}
					const user = await response.json();
					set({ user });
					return user;
				} catch (error) {
					console.error("Error fetching user:", error);
					return null;
				}
			},
			getOAuthAccounts: async () => {
				const response = await client.user["oauth-accounts"].$get();
				if (!response.ok) {
					return [];
				}
				const { accounts } = await response.json();
				set({ oAuthAccounts: accounts });
				return accounts;
			},
		}),
		{
			name: "user-storage", // unique name for storage
			storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
		}
	)
);

export default useUserStore;

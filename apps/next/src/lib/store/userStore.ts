import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Api } from "../api.client";
import type { InferResponseType } from "hono/client";

type User = NonNullable<InferResponseType<(typeof Api.client)["user"]["$get"]>>;

const useUserStore = create(
	persist<{
		user: User | null;
		setUser: (user: User | null) => void;
		getUser: () => Promise<User | null>;
	}>(
		set => ({
			user: null,
			setUser: (user: User | null) => set({ user }),
			getUser: async () => {
				try {
					const response = await Api.client.user.$get();
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
		}),
		{
			name: "user-storage", // unique name for storage
			storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
		}
	)
);

export default useUserStore;

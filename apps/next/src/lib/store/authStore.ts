import { create } from "zustand";

type AuthStore = {
	getItem: (key: string) => Promise<string | null>;
	setItem: (key: string, value: string) => Promise<void>;
	deleteItem: (key: string) => Promise<void>;
};

const useAuthStore = create<AuthStore>(set => ({
	getItem: async (key: string) => {
		await Promise.resolve();
		return localStorage.getItem(key);
	},
	setItem: async (key: string, value: string) => {
		await Promise.resolve();
		localStorage.setItem(key, value);
	},
	deleteItem: async (key: string) => {
		await Promise.resolve();
		localStorage.removeItem(key);
	},
}));

export default useAuthStore;

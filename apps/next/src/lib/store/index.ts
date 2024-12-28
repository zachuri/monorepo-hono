import { User } from "@repo/api/db/schema";
import { create } from "zustand";

type Store = {
	getItem: (key: string) => Promise<string | null>;
	setItem: (key: string, value: string) => Promise<void>;
	deleteItem: (key: string) => Promise<void>;
	getUser: () => Promise<string | null>;
	setUser: (user: string) => Promise<void>;
	deleteUser: () => Promise<void>;
};

const useStore = create<Store>(set => ({
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
	getUser: async () => {
		await Promise.resolve();
		return localStorage.getItem("user");
	},
	setUser: async (user: string) => {
		await Promise.resolve();
		localStorage.setItem("user", user);
	},
	deleteUser: async () => {
		await Promise.resolve();
		localStorage.removeItem("user");
	},
}));

export default useStore;

"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{ user: any | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState(null);

	useEffect(() => {
		axios
			.get("/api/auth")
			.then(res => setUser(res.data.user))
			.catch(() => setUser(null));
	}, []);

	return (
		<AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}

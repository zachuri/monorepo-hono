"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <div>{children}</div>;
}

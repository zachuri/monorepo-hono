import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AppLayout() {
	const { loading, user } = useAuth();

	if (loading) {
		return (
			<>
				<p>Loading...</p>
			</>
		);
	}
	if (!user) {
		return <Link href='/auth/sign-in' />;
	}

	return <></>;
}

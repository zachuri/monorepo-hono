import { createBrowserClient } from "@supabase/ssr";

// TODO: add zod validator check
export const supabase = createBrowserClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

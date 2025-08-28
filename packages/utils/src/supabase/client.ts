import { createBrowserClient } from '@supabase/ssr';

type SupabaseBrowserClientOptions = {
  url?: string;
  anonKey?: string;
};

export function createSupabaseBrowserClient(
  options?: SupabaseBrowserClientOptions,
) {
  const supabaseUrl =
    options?.url ?? (process.env.NEXT_PUBLIC_SUPABASE_URL as string);
  const supabaseAnonKey =
    options?.anonKey ?? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

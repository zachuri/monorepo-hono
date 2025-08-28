'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from './client';

type UseSupabaseUserResult = {
  user: User | null;
  email: string | null;
  loading: boolean;
};

type UseSupabaseUserOptions = {
  url?: string;
  anonKey?: string;
};

export function useUser(
  options?: UseSupabaseUserOptions,
): UseSupabaseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(
    () => createSupabaseBrowserClient(options),
    [options],
  );

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    };
    void loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    email: user?.email ?? null,
    loading,
  };
}

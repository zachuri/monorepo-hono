// import { Toaster } from '@ui/components/ui/sonner';
// import { ThemeScript } from 'next-app-theme/theme-script';
// import type React from 'react';

// export function Providers({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <>
//       {children}
//       <Toaster />
//       <ThemeScript />
//     </>
//   );
// }

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';

const queryClient = new QueryClient();

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: place all third party context providers here
  return (
    <QueryClientProvider client={queryClient}>
      <div>{children}</div>
    </QueryClientProvider>
  );
}

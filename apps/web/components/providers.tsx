'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import * as React from 'react';
import { Toaster } from 'sonner';
import { ApiError } from '@/lib/api-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => !(error instanceof ApiError && [401, 403, 404].includes(error.status)) && count < 2,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {/* LazyMotion + domAnimation keeps the animation bundle small; "user" honours prefers-reduced-motion */}
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
      <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 5000 }} />
    </QueryClientProvider>
  );
}

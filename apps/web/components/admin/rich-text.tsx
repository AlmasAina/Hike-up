'use client';

import dynamic from 'next/dynamic';

/** Lazy-loaded editor keeps TipTap out of every admin bundle that doesn't need it. */
export const RichText = dynamic(() => import('./rich-text-editor'), {
  ssr: false,
  loading: () => <div className="skeleton h-56 rounded-xl" />,
});

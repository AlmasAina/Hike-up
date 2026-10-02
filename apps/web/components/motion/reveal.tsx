'use client';

import { m, type Variants } from 'motion/react';
import * as React from 'react';

/*
 * Scroll-reveal helpers.
 * - The same element type renders on server and client (no hydration mismatch).
 * - <MotionConfig reducedMotion="user"> (see providers.tsx) removes the movement for users who
 *   prefer reduced motion; only a short fade remains.
 * - A <noscript> rule in the root layout shows [data-reveal] content when JavaScript is disabled.
 */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay } }),
};

const viewport = { once: true, margin: '-60px' } as const;

type RevealTag = 'div' | 'section' | 'li' | 'article';

export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: RevealTag;
}) {
  const Component = m[as];
  return (
    <Component data-reveal="" className={className} initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp} custom={delay}>
      {children}
    </Component>
  );
}

/** Staggers its direct <RevealItem> children. */
export function RevealGroup({ children, className, as = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'ul' }) {
  const Component = m[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({ children, className, as = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const Component = m[as];
  return (
    <Component data-reveal="" className={className} variants={fadeUp}>
      {children}
    </Component>
  );
}

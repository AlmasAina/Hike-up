'use client';

import { AirVent, Droplets, PaintRoller, ShieldCheck, Wrench, Zap } from 'lucide-react';
import { m } from 'motion/react';
import Image from 'next/image';

const CHIPS = [
  { Icon: Zap, label: 'Electrical', className: 'left-0 top-10 sm:-left-6' },
  { Icon: Droplets, label: 'Plumbing', className: 'right-0 top-2 sm:-right-4' },
  { Icon: AirVent, label: 'AC & HVAC', className: '-left-2 bottom-24 sm:-left-10' },
  { Icon: PaintRoller, label: 'Painting', className: 'right-2 bottom-28 sm:-right-8' },
  { Icon: Wrench, label: 'Handyman', className: 'left-1/2 -bottom-4 -translate-x-1/2' },
];

/** Animated brand composition: logo emblem in a glass card orbited by service chips. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <div className="absolute inset-6 rounded-full bg-gold-500/20 blur-3xl" aria-hidden />
      <svg className="absolute inset-0 size-full" viewBox="0 0 400 400" aria-hidden>
        <circle cx="200" cy="200" r="190" fill="none" stroke="white" strokeOpacity="0.12" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="white" strokeOpacity="0.08" />
      </svg>
      <m.div
        data-reveal=""
        className="absolute inset-[18%] grid place-items-center rounded-[2.5rem] border border-white/15 bg-white/[0.07] shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image src="/brand/hikeup-mark-light.png" alt="" width={512} height={370} priority className="w-[78%] drop-shadow-2xl" />
        <span className="absolute -bottom-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-bold text-navy-950 shadow-gold">
          <ShieldCheck className="size-3.5" aria-hidden /> Available 24/7
        </span>
      </m.div>
      {CHIPS.map(({ Icon, label, className }, i) => (
        <m.div
          key={label}
          data-reveal=""
          className={`absolute ${className}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
        >
          <div
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-navy-900/70 px-3 py-2 text-sm font-semibold text-white shadow-lift backdrop-blur-md motion-safe:animate-float"
            style={{ animationDelay: `${i * 0.8}s` }}
          >
            <span className="grid size-8 place-items-center rounded-xl bg-gold-500 text-navy-950">
              <Icon className="size-4" aria-hidden />
            </span>
            {label}
          </div>
        </m.div>
      ))}
    </div>
  );
}

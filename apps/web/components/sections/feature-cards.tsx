import type { ContentItem } from '@hikeup/types';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { DynamicIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

/** Icon cards used for "Why choose us", values and trust reasons (content is CMS-driven). */
export function FeatureCards({ items, columns = 4, tone = 'light' }: { items: ContentItem[]; columns?: 3 | 4; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  return (
    <RevealGroup className={cn('grid gap-5 sm:grid-cols-2', columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
      {items.map((item) => (
        <RevealItem
          key={item.title}
          className={cn(
            'group relative overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1',
            dark ? 'bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/[0.1]' : 'border border-line bg-white shadow-soft hover:shadow-lift',
          )}
        >
          <span
            className={cn(
              'grid size-12 place-items-center rounded-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3',
              dark ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-gold-400',
            )}
          >
            <DynamicIcon name={item.icon} className="size-6" />
          </span>
          <h3 className={cn('mt-5 text-lg font-bold', dark ? 'text-white' : 'text-navy-900')}>{item.title}</h3>
          {item.description && <p className={cn('mt-2 text-[15px] leading-relaxed', dark ? 'text-navy-200' : 'text-slate-600')}>{item.description}</p>}
          <span className="absolute inset-x-6 bottom-0 h-1 origin-left scale-x-0 rounded-t-full bg-gold-500 transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

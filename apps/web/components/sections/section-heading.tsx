import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'dark',
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  align?: 'center' | 'left';
  tone?: 'dark' | 'light';
  className?: string;
  id?: string;
}) {
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <span className={cn('eyebrow', tone === 'light' && 'bg-white/10 text-gold-300 ring-white/15')}>{eyebrow}</span>}
      <h2 id={id} className={cn('heading-lg mt-4', tone === 'light' && 'text-white')}>
        {title}
      </h2>
      {subtitle && <p className={cn('lead mt-4', tone === 'light' && 'text-navy-200')}>{subtitle}</p>}
    </Reveal>
  );
}

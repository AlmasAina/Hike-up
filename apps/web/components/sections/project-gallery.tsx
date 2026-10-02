'use client';

import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import * as React from 'react';
import type { ProjectImage } from '@hikeup/types';
import { SmartImage } from '@/components/smart-image';
import { Dialog, DialogContent } from '@/components/ui/dialog';

/** Image grid with an accessible keyboard-navigable lightbox. */
export function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [index, setIndex] = React.useState<number | null>(null);
  const open = index !== null;
  const go = React.useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)), [images.length]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {images.map((image, i) => (
          <li key={image.id} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy-900"
              aria-label={`Open image ${i + 1} of ${images.length}`}
            >
              <SmartImage src={image.url} alt={image.alt ?? title} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white/90 text-navy-800 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="size-4" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent title={`${title} — image ${(index ?? 0) + 1} of ${images.length}`} hideTitle className="max-w-5xl bg-navy-950 p-2 sm:p-3">
          {current && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <SmartImage src={current.url} alt={current.alt ?? title} fill sizes="90vw" className="object-contain" />
            </div>
          )}
          {images.length > 1 && (
            <div className="mt-3 flex items-center justify-between px-1 text-white">
              <button type="button" onClick={() => go(-1)} className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Previous image">
                <ChevronLeft className="size-5" />
              </button>
              <span className="text-sm text-navy-200">
                {(index ?? 0) + 1} / {images.length}
              </span>
              <button type="button" onClick={() => go(1)} className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Next image">
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

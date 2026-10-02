'use client';

import { ImagePlus, X } from 'lucide-react';
import * as React from 'react';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from '@hikeup/types';
import { cn, formatBytes } from '@/lib/utils';

export interface PickedImage {
  file: File;
  preview: string;
}

/** Validates type/size client-side (the API re-validates content) and shows thumbnails. */
export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) return `${file.name}: only JPEG, PNG or WEBP images are allowed`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must be ${formatBytes(MAX_IMAGE_BYTES)} or smaller`;
  return null;
}

export function ImagePicker({
  value,
  onChange,
  max,
  onError,
  disabled,
  id = 'images',
}: {
  value: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  max: number;
  onError: (message: string) => void;
  disabled?: boolean;
  id?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);

  React.useEffect(() => () => value.forEach((img) => URL.revokeObjectURL(img.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const add = (files: FileList | File[]) => {
    const next = [...value];
    for (const file of Array.from(files)) {
      if (next.length >= max) {
        onError(`You can attach up to ${max} images`);
        break;
      }
      const error = validateImageFile(file);
      if (error) {
        onError(error);
        continue;
      }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    onChange(next);
  };

  const remove = (index: number) => {
    URL.revokeObjectURL(value[index].preview);
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition',
          dragging ? 'border-gold-500 bg-gold-50' : 'border-slate-300 bg-surface hover:border-navy-300',
        )}
      >
        <ImagePlus className="size-8 text-navy-500" aria-hidden />
        <p className="mt-3 text-sm text-slate-600">
          <button type="button" className="font-semibold text-navy-700 underline underline-offset-4" onClick={() => inputRef.current?.click()} disabled={disabled}>
            Choose photos
          </button>{' '}
          or drag them here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          JPEG, PNG or WEBP · up to {max} images · max {formatBytes(MAX_IMAGE_BYTES)} each
        </p>
        <input
          ref={inputRef}
          id={id}
          data-ready={ready ? 'true' : undefined}
          type="file"
          accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
          multiple
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {value.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {value.map((img, i) => (
            <li key={img.preview} className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={img.preview} alt={`Selected image ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={disabled}
                className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-navy-950/80 text-white transition hover:bg-rose-600"
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

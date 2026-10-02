'use client';

import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { validateImageFile } from '@/components/forms/image-picker';
import { SmartImage } from '@/components/smart-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorMessage, uploadWithProgress } from '@/lib/api-client';

export type UploadFolder = 'services' | 'projects' | 'testimonials' | 'technicians' | 'content' | 'brand' | 'packages';
export interface UploadedImage {
  url: string;
  key?: string | null;
  alt?: string | null;
}

async function uploadImage(file: File, folder: UploadFolder, onProgress?: (p: number) => void): Promise<UploadedImage> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);
  const form = new FormData();
  form.append('file', file);
  return uploadWithProgress<{ key: string; url: string }>(`/admin/uploads/image?folder=${folder}`, form, onProgress);
}

/** Single image field (service hero, testimonial photo, section image …). */
export function SingleImageUpload({
  value,
  onChange,
  folder,
  label = 'Image',
}: {
  value: UploadedImage | null;
  onChange: (value: UploadedImage | null) => void;
  folder: UploadFolder;
  label?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [progress, setProgress] = React.useState<number | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      setProgress(0);
      onChange(await uploadImage(file, folder, setProgress));
    } catch (e) {
      toast.error('Upload failed', { description: errorMessage(e) });
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative aspect-[3/2] w-full max-w-60 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
        {value?.url ? (
          <SmartImage src={value.url} alt={value.alt ?? ''} fill sizes="240px" className="object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-slate-400">
            <ImagePlus className="size-8" aria-hidden />
          </div>
        )}
        {progress !== null && (
          <div className="absolute inset-0 grid place-items-center bg-white/80 text-sm font-semibold text-navy-800">
            <Loader2 className="size-5 animate-spin" aria-hidden /> {progress}%
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()} disabled={progress !== null}>
          <Upload aria-hidden /> {value?.url ? 'Replace' : 'Upload'} {label.toLowerCase()}
        </Button>
        {value?.url && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)} aria-label={`Remove ${label}`}>
            <Trash2 aria-hidden />
          </Button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

/** Multi-image gallery with upload progress, alt text and ordering. */
export function GalleryUpload({ value, onChange, folder, max = 20 }: { value: UploadedImage[]; onChange: (value: UploadedImage[]) => void; folder: UploadFolder; max?: number }) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState<{ done: number; total: number } | null>(null);
  const latest = React.useRef(value);
  React.useEffect(() => {
    latest.current = value;
  }, [value]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, Math.max(0, max - value.length));
    if (list.length < files.length) toast.message(`Only ${max} images are allowed`);
    setUploading({ done: 0, total: list.length });
    const added: UploadedImage[] = [];
    for (const file of list) {
      try {
        added.push(await uploadImage(file, folder));
      } catch (e) {
        toast.error(`${file.name} was not uploaded`, { description: errorMessage(e) });
      }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    onChange([...latest.current, ...added]);
    setUploading(null);
  };

  const move = (index: number, delta: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {value.map((img, i) => (
            <li key={`${img.url}-${i}`} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-2">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <SmartImage src={img.url} alt={img.alt ?? ''} fill sizes="80px" className="object-cover" />
                {i === 0 && <span className="absolute bottom-0 left-0 rounded-tr-md bg-gold-500 px-1.5 text-[10px] font-bold text-navy-950">COVER</span>}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Input
                  className="h-8 text-xs"
                  placeholder="Alt text (describe the image)"
                  aria-label={`Alt text for image ${i + 1}`}
                  value={img.alt ?? ''}
                  onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, alt: e.target.value } : v)))}
                />
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="ghost" className="h-7 px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                    <ArrowUp aria-hidden />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 px-2" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                    <ArrowDown aria-hidden />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="ml-auto h-7 px-2 text-rose-600" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove image">
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={Boolean(uploading) || value.length >= max}>
        {uploading ? <Loader2 className="animate-spin" aria-hidden /> : <ImagePlus aria-hidden />}
        {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : 'Add images'}
      </Button>
      <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { void onFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

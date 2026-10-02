'use client';

import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import * as React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import type { ContentSection } from '@hikeup/types';
import { FieldList } from '@/components/admin/field-list';
import { IconPicker } from '@/components/admin/icon-picker';
import { SingleImageUpload } from '@/components/admin/image-upload';
import { PageHeader } from '@/components/admin/page-header';
import { RichText } from '@/components/admin/rich-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';

/** Which fields each section uses on the website. */
const SECTIONS: { key: string; label: string; page: 'Homepage' | 'About'; fields: ('title' | 'subtitle' | 'body' | 'image' | 'items')[]; itemDescriptions?: boolean }[] = [
  { key: 'home.hero', label: 'Hero', page: 'Homepage', fields: ['title', 'subtitle', 'items'] },
  { key: 'home.why_choose', label: 'Why Choose Us', page: 'Homepage', fields: ['title', 'subtitle', 'items'], itemDescriptions: true },
  { key: 'home.how_it_works', label: 'How It Works', page: 'Homepage', fields: ['title', 'subtitle', 'items'], itemDescriptions: true },
  { key: 'about.intro', label: 'About HIKE UP', page: 'About', fields: ['title', 'subtitle', 'body', 'image'] },
  { key: 'about.mission', label: 'Our Mission', page: 'About', fields: ['title', 'body'] },
  { key: 'about.vision', label: 'Our Vision', page: 'About', fields: ['title', 'body'] },
  { key: 'about.values', label: 'Our Values', page: 'About', fields: ['title', 'subtitle', 'items'], itemDescriptions: true },
  { key: 'about.approach', label: 'Our Approach', page: 'About', fields: ['title', 'subtitle', 'body'] },
  { key: 'about.why_trust', label: 'Why Customers Trust Us', page: 'About', fields: ['title', 'subtitle', 'items'], itemDescriptions: true },
];

interface Values {
  title: string;
  subtitle: string;
  body: string;
  image: { url: string; key?: string | null } | null;
  items: { title: string; description: string; icon: string }[];
}

function SectionEditor({ def, section }: { def: (typeof SECTIONS)[number]; section?: ContentSection }) {
  const { register, control, handleSubmit } = useForm<Values>({
    defaultValues: {
      title: section?.title ?? '',
      subtitle: section?.subtitle ?? '',
      body: section?.body ?? '',
      image: section?.imageUrl ? { url: section.imageUrl, key: section.imageKey } : null,
      items: (section?.items ?? []).map((i) => ({ title: i.title, description: i.description ?? '', icon: i.icon ?? 'wrench' })),
    },
  });
  const items = useFieldArray({ control, name: 'items' });
  const save = useAdminMutation(
    (v: Values) => {
      const body: Record<string, unknown> = {};
      if (def.fields.includes('title')) body.title = v.title;
      if (def.fields.includes('subtitle')) body.subtitle = v.subtitle;
      if (def.fields.includes('body')) body.body = v.body;
      if (def.fields.includes('image')) Object.assign(body, { imageUrl: v.image?.url ?? '', imageKey: v.image?.key ?? '' });
      if (def.fields.includes('items')) body.items = v.items.filter((i) => i.title.trim()).map((i) => ({ title: i.title.trim(), ...(i.description.trim() ? { description: i.description.trim() } : {}), icon: i.icon }));
      return api(`/admin/content/${def.key}`, { method: 'PATCH', body });
    },
    { success: `${def.label} saved`, invalidate: [['admin', 'content']] },
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{def.label}</CardTitle>
          <p className="text-xs text-slate-500">Last updated {formatDateTime(section?.updatedAt)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-5">
          {def.fields.includes('title') && (
            <FormField id={`${def.key}-title`} label="Title">
              <Input {...register('title')} />
            </FormField>
          )}
          {def.fields.includes('subtitle') && (
            <FormField id={`${def.key}-subtitle`} label="Subtitle">
              <Textarea rows={2} {...register('subtitle')} />
            </FormField>
          )}
          {def.fields.includes('body') && (
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Controller control={control} name="body" render={({ field }) => <RichText value={field.value} onChange={field.onChange} minHeight={160} />} />
            </div>
          )}
          {def.fields.includes('image') && (
            <div className="space-y-1.5">
              <Label>Image</Label>
              <Controller control={control} name="image" render={({ field }) => <SingleImageUpload value={field.value} onChange={field.onChange} folder="content" />} />
            </div>
          )}
          {def.fields.includes('items') && (
            <div className="space-y-1.5">
              <Label>Items</Label>
              <FieldList
                fields={items.fields}
                onAdd={() => items.append({ title: '', description: '', icon: 'wrench' })}
                onRemove={items.remove}
                onMove={items.move}
                addLabel="Add item"
                render={(_, i) => (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Controller control={control} name={`items.${i}.icon`} render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />} />
                    <div className="flex-1 space-y-2">
                      <Input aria-label={`Item ${i + 1} title`} placeholder="Title" {...register(`items.${i}.title`)} />
                      {def.itemDescriptions && <Input aria-label={`Item ${i + 1} description`} placeholder="Description" {...register(`items.${i}.description`)} />}
                    </div>
                  </div>
                )}
              />
            </div>
          )}
          <Button type="submit" variant="navy" loading={save.isPending}>
            <Save aria-hidden /> Save section
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminContentPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'content'], queryFn: () => api<ContentSection[]>('/admin/content') });
  if (error) return <ErrorState onRetry={() => refetch()} />;
  const byKey = new Map((data ?? []).map((s) => [s.key, s]));
  return (
    <>
      <PageHeader title="Page Content" description="Edit the About page and homepage sections without touching code. Changes publish immediately." />
      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <Tabs defaultValue="About">
          <TabsList>
            <TabsTrigger value="About">About page</TabsTrigger>
            <TabsTrigger value="Homepage">Homepage</TabsTrigger>
          </TabsList>
          {(['About', 'Homepage'] as const).map((page) => (
            <TabsContent key={page} value={page} className="mt-6 space-y-6">
              {SECTIONS.filter((s) => s.page === page).map((def) => (
                <SectionEditor key={`${def.key}-${byKey.get(def.key)?.updatedAt ?? ''}`} def={def} section={byKey.get(def.key)} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Save } from 'lucide-react';
import * as React from 'react';
import type { LegalPage } from '@hikeup/types';
import { PageHeader } from '@/components/admin/page-header';
import { RichText } from '@/components/admin/rich-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';

function LegalEditor({ page }: { page: LegalPage }) {
  const [title, setTitle] = React.useState(page.title);
  const [content, setContent] = React.useState(page.content);
  const [published, setPublished] = React.useState(page.published);
  const save = useAdminMutation(() => api(`/admin/legal/${page.id}`, { method: 'PATCH', body: { title, content, published } }), { success: `${page.title} saved`, invalidate: [['admin', 'legal']] });
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <FormField id={`legal-${page.slug}`} label="Page title" className="flex-1">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <div className="flex items-center gap-2 pb-2.5">
            <Switch id={`pub-${page.slug}`} checked={published} onCheckedChange={setPublished} />
            <Label htmlFor={`pub-${page.slug}`}>Published</Label>
          </div>
        </div>
        <RichText value={content} onChange={setContent} minHeight={420} />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="navy" loading={save.isPending} disabled={!title.trim() || !content.trim()} onClick={() => save.mutate(undefined)}>
            <Save aria-hidden /> Save page
          </Button>
          <Button asChild variant="outline">
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden /> View page
            </a>
          </Button>
          <span className="text-xs text-slate-500">Last updated {formatDateTime(page.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminLegalPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'legal'], queryFn: () => api<LegalPage[]>('/admin/legal') });
  if (error) return <ErrorState onRetry={() => refetch()} />;
  return (
    <>
      <PageHeader title="Legal Pages" description="Privacy policy, terms and cancellation policy. The seeded wording is a generic template — have it reviewed by a qualified UAE legal adviser." />
      {isLoading || !data ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <Tabs defaultValue={data[0]?.slug}>
          <TabsList>
            {data.map((p) => (
              <TabsTrigger key={p.slug} value={p.slug}>
                {p.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {data.map((p) => (
            <TabsContent key={p.slug} value={p.slug} className="mt-6">
              <LegalEditor key={p.updatedAt} page={p} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}

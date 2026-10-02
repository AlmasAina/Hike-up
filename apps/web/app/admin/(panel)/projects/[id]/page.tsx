'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import type { Project } from '@hikeup/types';
import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/project-form';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { api, errorMessage } from '@/lib/api-client';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'project', id], queryFn: () => api<Project>(`/admin/projects/${id}`) });
  if (error) return <ErrorState description={errorMessage(error)} onRetry={() => refetch()} />;
  if (isLoading || !data) return <Skeleton className="h-[40rem] rounded-2xl" />;
  return (
    <>
      <PageHeader title={`Edit project: ${data.title}`} />
      <ProjectForm key={data.id + data.images.length} project={data} />
    </>
  );
}

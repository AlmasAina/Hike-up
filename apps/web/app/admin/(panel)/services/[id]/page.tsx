'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import type { ServiceDetail } from '@hikeup/types';
import { PageHeader } from '@/components/admin/page-header';
import { ServiceForm } from '@/components/admin/service-form';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { api, errorMessage } from '@/lib/api-client';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'service', id], queryFn: () => api<ServiceDetail>(`/admin/services/${id}`) });
  if (error) return <ErrorState description={errorMessage(error)} onRetry={() => refetch()} />;
  if (isLoading || !data) return <Skeleton className="h-[40rem] rounded-2xl" />;
  return (
    <>
      <PageHeader title={`Edit: ${data.title}`} description="Changes appear on the website immediately after saving." />
      <ServiceForm key={data.updatedAt} service={data} />
    </>
  );
}

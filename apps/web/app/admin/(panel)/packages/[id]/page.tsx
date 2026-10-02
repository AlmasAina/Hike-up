'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import type { MaintenancePackage } from '@hikeup/types';
import { PackageForm } from '@/components/admin/package-form';
import { PageHeader } from '@/components/admin/page-header';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { api, errorMessage } from '@/lib/api-client';

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'package', id], queryFn: () => api<MaintenancePackage>(`/admin/packages/${id}`) });
  if (error) return <ErrorState description={errorMessage(error)} onRetry={() => refetch()} />;
  if (isLoading || !data) return <Skeleton className="h-[40rem] rounded-2xl" />;
  return (
    <>
      <PageHeader title={`Edit package: ${data.name}`} />
      <PackageForm key={JSON.stringify(data.features.map((f) => f.id))} pkg={data} />
    </>
  );
}

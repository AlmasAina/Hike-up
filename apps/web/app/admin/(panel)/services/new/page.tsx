import { PageHeader } from '@/components/admin/page-header';
import { ServiceForm } from '@/components/admin/service-form';

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="New service" description="Create a service page. It stays hidden until you publish it." />
      <ServiceForm />
    </>
  );
}

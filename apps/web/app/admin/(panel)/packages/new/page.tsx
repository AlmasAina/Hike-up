import { PackageForm } from '@/components/admin/package-form';
import { PageHeader } from '@/components/admin/page-header';

export default function NewPackagePage() {
  return (
    <>
      <PageHeader title="New package" />
      <PackageForm />
    </>
  );
}

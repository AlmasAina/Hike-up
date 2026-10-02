import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/project-form';

export default function NewProjectPage() {
  return (
    <>
      <PageHeader title="New project" />
      <ProjectForm />
    </>
  );
}

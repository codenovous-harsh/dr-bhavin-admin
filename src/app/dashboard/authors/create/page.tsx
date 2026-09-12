import { AuthorForm } from '@/features/authors/components/author-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';

export default function CreateAuthorPage() {
  return (
    <PageContainer
      pageTitle="New Author"
      pageDescription="Create a profile once — every post they write reuses it"
      pageHeaderAction={
        <Link href="/dashboard/authors">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Authors
          </Button>
        </Link>
      }
    >
      <AuthorForm mode="create" />
    </PageContainer>
  );
}

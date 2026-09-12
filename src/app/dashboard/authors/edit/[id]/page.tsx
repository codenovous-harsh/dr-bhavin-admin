'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { AuthorForm } from '@/features/authors/components/author-form';
import { authorService } from '@/services/author.service';
import type { Author } from '@/types/author';

export default function EditAuthorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        setAuthor(await authorService.getAuthorById(id));
      } catch (error) {
        console.error('Failed to fetch author:', error);
        toast.error('Failed to load author');
        router.push('/dashboard/authors');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[600px] flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!author) return null;

  return (
    <PageContainer
      pageTitle={`Edit ${author.name}`}
      pageDescription="Changes here update the byline on every post by this author"
      pageHeaderAction={
        <Link href="/dashboard/authors">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Authors
          </Button>
        </Link>
      }
    >
      <AuthorForm initialData={author} mode="edit" />
    </PageContainer>
  );
}

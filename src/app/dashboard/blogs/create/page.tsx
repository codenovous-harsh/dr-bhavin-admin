import { BlogForm } from '@/features/blogs/components/blog-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';

export default function CreateBlogPage() {
  return (
    <PageContainer
      pageTitle="Create Blog Post"
      pageDescription="Write and publish a new blog post"
      pageHeaderAction={
        <Link href="/dashboard/blogs">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
      }
    >
      <BlogForm mode="create" />
    </PageContainer>
  );
}

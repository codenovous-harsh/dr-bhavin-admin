import { BlogForm } from '@/features/blogs/components/blog-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreateBlogPage() {
  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Blog Post</h2>
          <p className="text-muted-foreground mt-1">
            Write and publish a new blog post
          </p>
        </div>
        <Link href="/dashboard/blogs">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>

      <BlogForm mode="create" />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BlogForm } from '@/features/blogs/components/blog-form';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/types/blog';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const blogData = await blogService.getBlogById(id);
      setBlog(blogData);
    } catch (error: any) {
      console.error('Failed to fetch blog:', error);
      toast.error('Failed to load blog');
      router.push('/dashboard/blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Blog not found</h2>
          <p className="text-muted-foreground mb-4">
            The blog post you're trying to edit doesn't exist.
          </p>
          <Link href="/dashboard/blogs">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Blog Post</h2>
          <p className="text-muted-foreground mt-1">
            Update your blog post content and settings
          </p>
        </div>
        <Link href="/dashboard/blogs">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>

      <BlogForm initialData={blog} mode="edit" />
    </div>
  );
}

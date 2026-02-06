'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { blogService } from '@/services/blog.service';
import type { Blog } from '@/types/blog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Clock, Eye, Edit, Star, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import 'react-quill-new/dist/quill.snow.css';

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const blogData = await blogService.getBlogBySlug(slug, false);
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
            The blog post you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/dashboard/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  const getAuthorInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/blogs/edit/${blog._id}`)}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Author Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={blog.author.avatar?.url}
                    alt={blog.author.name}
                  />
                  <AvatarFallback className="text-lg">
                    {getAuthorInitials(blog.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{blog.author.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {blog.author.title || 'Author'}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Published on</p>
                    <p className="font-medium text-foreground">
                      {blog.publishedAt
                        ? format(new Date(blog.publishedAt), 'MMMM dd, yyyy')
                        : 'Not published'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Reading time</p>
                    <p className="font-medium text-foreground">
                      {blog.readTime} min read
                    </p>
                  </div>
                </div>

                {blog.status === 'published' && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Eye className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total views</p>
                      <p className="font-medium text-foreground">
                        {blog.views.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <p className="text-xs text-muted-foreground mb-3">Status</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={blog.status === 'published' ? 'default' : 'secondary'}
                  >
                    {blog.status}
                  </Badge>
                  {blog.isFeatured && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {blog.tags.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Blog Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {/* Featured Image */}
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={blog.featuredImage.url}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Blog Title */}
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {blog.title}
              </h1>

              {/* Blog Excerpt */}
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {blog.excerpt}
              </p>

              <Separator className="my-8" />

              {/* Blog Content */}
              <div className="ql-container ql-snow" style={{ border: 'none' }}>
                <div
                  className="ql-editor prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
                  style={{
                    padding: 0,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              {/* SEO Metadata (for admin reference) */}
              {blog.metadata && (blog.metadata.seoTitle || blog.metadata.seoDescription) && (
                <>
                  <Separator className="my-8" />
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2">SEO Metadata</h3>
                    {blog.metadata.seoTitle && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">SEO Title</p>
                        <p className="text-sm">{blog.metadata.seoTitle}</p>
                      </div>
                    )}
                    {blog.metadata.seoDescription && (
                      <div>
                        <p className="text-xs text-muted-foreground">SEO Description</p>
                        <p className="text-sm">{blog.metadata.seoDescription}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

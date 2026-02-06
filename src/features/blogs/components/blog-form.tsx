'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogFormSchema, type BlogFormValues, type Blog } from '@/types/blog';
import { blogService } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormFileUpload } from '@/components/forms/form-file-upload';
import { FormSwitch } from '@/components/forms/form-switch';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BlogFormProps {
  initialData?: Blog;
  mode?: 'create' | 'edit';
}

export function BlogForm({ initialData, mode = 'create' }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      featuredImageUrl: initialData?.featuredImage.url || '',
      featuredImageKey: initialData?.featuredImage.key || '',
      author: {
        name: initialData?.author.name || '',
        avatarUrl: initialData?.author.avatar?.url || '',
        avatarKey: initialData?.author.avatar?.key || '',
        title: initialData?.author.title || 'Author'
      },
      tags: initialData?.tags || [],
      status: initialData?.status || 'draft',
      isFeatured: initialData?.isFeatured || false,
      metadata: {
        seoTitle: initialData?.metadata?.seoTitle || '',
        seoDescription: initialData?.metadata?.seoDescription || ''
      }
    }
  });

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      form.setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: BlogFormValues) => {
    try {
      setIsSubmitting(true);

      const blogData = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage
          ? (Array.isArray(data.featuredImage) ? data.featuredImage[0] : data.featuredImage)
          : undefined,
        featuredImageUrl: data.featuredImageUrl,
        featuredImageKey: data.featuredImageKey,
        author: {
          name: data.author.name,
          avatar: data.author.avatar
            ? (Array.isArray(data.author.avatar) ? data.author.avatar[0] : data.author.avatar)
            : null,
          avatarUrl: data.author.avatarUrl,
          avatarKey: data.author.avatarKey,
          title: data.author.title || 'Author'
        },
        tags: data.tags,
        status: data.status,
        isFeatured: data.isFeatured,
        metadata: data.metadata
      };

      if (mode === 'create') {
        // Validate required files for create mode
        if (!blogData.featuredImage && !blogData.featuredImageUrl) {
          toast.error('Featured image is required');
          return;
        }

        await blogService.createBlog({
          ...blogData,
          featuredImage: blogData.featuredImage!
        });
        toast.success('Blog created successfully');
      } else if (initialData) {
        await blogService.updateBlog(initialData._id, blogData);
        toast.success('Blog updated successfully');
      }

      router.push('/dashboard/blogs');
      router.refresh();
    } catch (error: any) {
      console.error('Blog form error:', error);
      toast.error(error.message || `Failed to ${mode} blog`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    form.setValue('status', 'draft');
    form.handleSubmit(onSubmit)();
  };

  const handlePublish = async () => {
    form.setValue('status', 'published');
    form.handleSubmit(onSubmit)();
  };

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blog Content</CardTitle>
                <CardDescription>
                  Write your blog post content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="Enter blog title"
                  required
                />

                <FormTextarea
                  control={form.control}
                  name="excerpt"
                  label="Excerpt"
                  placeholder="Brief summary of the blog post"
                  config={{
                    rows: 3,
                    maxLength: 500,
                    showCharCount: true
                  }}
                  required
                />

                <div className="space-y-2">
                  <Label>
                    Content <span className="text-destructive">*</span>
                  </Label>
                  <RichTextEditor
                    value={form.watch('content')}
                    onChange={(value) => form.setValue('content', value)}
                    placeholder="Write your blog content here..."
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Metadata</CardTitle>
                <CardDescription>
                  Optimize your blog for search engines (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  control={form.control}
                  name="metadata.seoTitle"
                  label="SEO Title"
                  placeholder="Custom SEO title (max 60 characters)"
                />

                <FormTextarea
                  control={form.control}
                  name="metadata.seoDescription"
                  label="SEO Description"
                  placeholder="Custom SEO description (max 160 characters)"
                  config={{
                    rows: 2,
                    maxLength: 160,
                    showCharCount: true
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>
                  Upload a cover image for your blog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormFileUpload
                  control={form.control}
                  name="featuredImage"
                  label=""
                  config={{
                    maxSize: 5 * 1024 * 1024,
                    maxFiles: 1,
                    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
                  }}
                  required={mode === 'create'}
                />
                {initialData?.featuredImage.url && !form.watch('featuredImage') && (
                  <div className="mt-2">
                    <img
                      src={initialData.featuredImage.url}
                      alt="Current featured image"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Author Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  control={form.control}
                  name="author.name"
                  label="Author Name"
                  placeholder="Enter author name"
                  required
                />

                <FormInput
                  control={form.control}
                  name="author.title"
                  label="Author Title"
                  placeholder="e.g., Cosmetic Dermatologist"
                />

                <FormFileUpload
                  control={form.control}
                  name="author.avatar"
                  label="Author Avatar"
                  config={{
                    maxSize: 2 * 1024 * 1024,
                    maxFiles: 1,
                    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
                  }}
                />
                {initialData?.author.avatar?.url && !form.watch('author.avatar') && (
                  <div className="mt-2">
                    <img
                      src={initialData.author.avatar.url}
                      alt="Current author avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Add tags to categorize your blog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a tag"
                    disabled={tags.length >= 10}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={tags.length >= 10 || !tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {form.formState.errors.tags && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tags.message}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {tags.length}/10 tags added
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormSwitch
                  control={form.control}
                  name="isFeatured"
                  label="Featured Blog"
                  description="Mark this blog as featured"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isSubmitting}
          >
            {isSubmitting && form.watch('status') === 'draft' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save as Draft
          </Button>

          <Button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting && form.watch('status') === 'published' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === 'create' ? 'Publish' : 'Update & Publish'}
          </Button>
        </div>
    </Form>
  );
}

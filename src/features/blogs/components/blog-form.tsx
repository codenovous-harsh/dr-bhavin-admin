'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
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
  const [faqRows, setFaqRows] = useState<{ question: string; answer: string }[]>(
    initialData?.faqs || []
  );

  // Upload state for featured image
  const [featuredImageUpload, setFeaturedImageUpload] = useState<{
    uploading: boolean;
    url?: string;
    key?: string;
    error?: string;
  }>({
    uploading: false,
    url: initialData?.featuredImage?.url,
    key: initialData?.featuredImage?.key
  });

  // Upload state for author avatar
  const [avatarUpload, setAvatarUpload] = useState<{
    uploading: boolean;
    url?: string;
    key?: string;
    error?: string;
  }>({
    uploading: false,
    url: initialData?.author?.avatar?.url,
    key: initialData?.author?.avatar?.key
  });

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      featuredImageUrl: initialData?.featuredImage.url || undefined,
      featuredImageKey: initialData?.featuredImage.key || undefined,
      featuredImageAlt: initialData?.featuredImage?.alt || '',
      author: {
        name: initialData?.author.name || '',
        avatarUrl: initialData?.author.avatar?.url || undefined,
        avatarKey: initialData?.author.avatar?.key || undefined,
        title: initialData?.author.title || 'Author',
        bio: initialData?.author.bio || ''
      },
      tags: initialData?.tags || [],
      status: initialData?.status || 'draft',
      isFeatured: initialData?.isFeatured || false,
      metadata: {
        seoTitle: initialData?.metadata?.seoTitle || '',
        seoDescription: initialData?.metadata?.seoDescription || ''
      },
      medicalReview: {
        reviewedBy: initialData?.medicalReview?.reviewedBy || 'Dr Bhavin Garara',
        credentialLine:
          initialData?.medicalReview?.credentialLine || 'GMC No. 7155707',
        reviewedAt: initialData?.medicalReview?.reviewedAt
          ? String(initialData.medicalReview.reviewedAt).substring(0, 10)
          : ''
      }
    }
  });

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      form.setValue('tags', newTags, {
        shouldValidate: true,
        shouldDirty: true
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addFaqRow = () =>
    setFaqRows((rows) => [...rows, { question: '', answer: '' }]);
  const updateFaqRow = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) =>
    setFaqRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  const removeFaqRow = (index: number) =>
    setFaqRows((rows) => rows.filter((_, i) => i !== index));

  // Upload handler for featured image
  const uploadFeaturedImage = async (file: File) => {
    setFeaturedImageUpload({ uploading: true });

    try {
      const response = await blogService.uploadImage(file);
      const url = response.data?.url;
      const key = response.data?.key;

      if (!url || !key) {
        throw new Error('Invalid upload response');
      }

      setFeaturedImageUpload({ uploading: false, url, key });
      form.setValue('featuredImageUrl', url, { shouldValidate: true });
      form.setValue('featuredImageKey', key, { shouldValidate: true });

      toast.success('Featured image uploaded successfully');
    } catch (error: any) {
      console.error('Featured image upload error:', error);
      setFeaturedImageUpload({
        uploading: false,
        error: error.message || 'Upload failed'
      });
      toast.error(error.message || 'Failed to upload featured image');
    }
  };

  // Upload handler for author avatar
  const uploadAuthorAvatar = async (file: File) => {
    setAvatarUpload({ uploading: true });

    try {
      const response = await blogService.uploadImage(file);
      const url = response.data?.url;
      const key = response.data?.key;

      if (!url || !key) {
        throw new Error('Invalid upload response');
      }

      setAvatarUpload({ uploading: false, url, key });
      form.setValue('author.avatarUrl', url, { shouldValidate: true });
      form.setValue('author.avatarKey', key, { shouldValidate: true });

      toast.success('Author avatar uploaded successfully');
    } catch (error: any) {
      console.error('Author avatar upload error:', error);
      setAvatarUpload({
        uploading: false,
        error: error.message || 'Upload failed'
      });
      toast.error(error.message || 'Failed to upload author avatar');
    }
  };

  // Watch for featured image file changes and auto-upload
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'featuredImage' && value.featuredImage) {
        const file = Array.isArray(value.featuredImage)
          ? value.featuredImage[0]
          : value.featuredImage;

        if (file instanceof File) {
          uploadFeaturedImage(file);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Watch for author avatar file changes and auto-upload
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'author.avatar' && value.author?.avatar) {
        const file = Array.isArray(value.author.avatar)
          ? value.author.avatar[0]
          : value.author.avatar;

        if (file instanceof File) {
          uploadAuthorAvatar(file);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: BlogFormValues) => {
    try {
      setIsSubmitting(true);

      // Use pre-uploaded URLs from state instead of uploading during submission
      const blogData = {
        title: data.title,
        slug: data.slug || undefined,
        excerpt: data.excerpt,
        content: data.content,
        featuredImageUrl: featuredImageUpload.url || data.featuredImageUrl || undefined,
        featuredImageKey: featuredImageUpload.key || data.featuredImageKey || undefined,
        featuredImageAlt: data.featuredImageAlt || undefined,
        author: {
          name: data.author.name,
          avatarUrl: avatarUpload.url || data.author.avatarUrl || undefined,
          avatarKey: avatarUpload.key || data.author.avatarKey || undefined,
          title: data.author.title || 'Author',
          bio: data.author.bio || undefined
        },
        tags: data.tags,
        status: data.status,
        isFeatured: data.isFeatured,
        metadata: data.metadata,
        medicalReview: {
          reviewedBy: data.medicalReview?.reviewedBy || undefined,
          credentialLine: data.medicalReview?.credentialLine || undefined,
          reviewedAt: data.medicalReview?.reviewedAt || null
        },
        faqs: faqRows
          .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
          .filter((f) => f.question && f.answer)
      };

      // A featured image is only required to PUBLISH — drafts save without one.
      const hasFeaturedImage =
        Boolean(blogData.featuredImageUrl) ||
        Boolean(initialData?.featuredImage?.url);
      if (data.status === 'published' && !hasFeaturedImage) {
        toast.error('A featured image is required to publish');
        return;
      }

      if (mode === 'create') {
        await blogService.createBlog(blogData);
        toast.success(
          data.status === 'published' ? 'Blog published' : 'Draft saved'
        );
      } else if (initialData) {
        await blogService.updateBlog(initialData._id, blogData);
        toast.success(
          data.status === 'published' ? 'Blog published' : 'Blog updated'
        );
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

    // Check if files are still uploading
    if (featuredImageUpload.uploading || avatarUpload.uploading) {
      toast.error('Please wait for files to finish uploading');
      return;
    }

    // Check for upload errors
    if (featuredImageUpload.error) {
      toast.error('Featured image upload failed. Please try again.');
      return;
    }

    if (avatarUpload.error) {
      toast.error('Author avatar upload failed. Please try again.');
      return;
    }

    // Trigger validation and show errors
    const isValid = await form.trigger();

    if (!isValid) {
      // Show which fields are invalid
      const errors = form.formState.errors;
      const errorFields = Object.keys(errors).join(', ');
      toast.error(`Please fix the following fields: ${errorFields}`);

      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      return;
    }

    // If valid, proceed with submission
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

                <FormInput
                  control={form.control}
                  name="slug"
                  label="URL slug"
                  placeholder="Leave blank to auto-generate, or e.g. future-of-medical-aesthetics-2026-2030"
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
                    onChange={(value) => {
                      form.setValue('content', value, {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                    placeholder="Write your blog content here..."
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive font-medium">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 50 characters required
                  </p>
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
                  placeholder="Custom SEO title (max 70 characters)"
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

            <Card>
              <CardHeader>
                <CardTitle>Medical Review</CardTitle>
                <CardDescription>
                  Shown as &ldquo;Medically reviewed by &hellip; (&hellip;) &middot;
                  Last reviewed: &hellip;&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  control={form.control}
                  name="medicalReview.reviewedBy"
                  label="Reviewed by"
                  placeholder="Dr Bhavin Garara"
                />
                <FormInput
                  control={form.control}
                  name="medicalReview.credentialLine"
                  label="Credential"
                  placeholder="GMC No. 7155707"
                />
                <div className="space-y-2">
                  <Label htmlFor="medicalReview-reviewedAt">
                    Last reviewed date
                  </Label>
                  <Input
                    id="medicalReview-reviewedAt"
                    type="date"
                    {...form.register('medicalReview.reviewedAt')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQs</CardTitle>
                <CardDescription>
                  Question &amp; answer rows shown as an accordion on the post
                  and used for FAQ rich results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqRows.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No FAQs added yet.
                  </p>
                )}
                {faqRows.map((row, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label>FAQ {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => removeFaqRow(index)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remove FAQ"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      value={row.question}
                      onChange={(e) =>
                        updateFaqRow(index, 'question', e.target.value)
                      }
                      placeholder="Question"
                    />
                    <textarea
                      value={row.answer}
                      onChange={(e) =>
                        updateFaqRow(index, 'answer', e.target.value)
                      }
                      placeholder="Answer"
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFaqRow}>
                  Add FAQ
                </Button>
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

                <div className="mt-4">
                  <FormInput
                    control={form.control}
                    name="featuredImageAlt"
                    label="Image alt text"
                    placeholder="Describe the image (accessibility & SEO)"
                  />
                </div>

                {/* Upload progress indicator */}
                {featuredImageUpload.uploading && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading featured image...</span>
                  </div>
                )}

                {/* Upload error */}
                {featuredImageUpload.error && (
                  <p className="mt-2 text-sm text-destructive">
                    {featuredImageUpload.error}
                  </p>
                )}

                {/* Show uploaded image preview */}
                {featuredImageUpload.url && !featuredImageUpload.uploading && (
                  <div className="mt-3">
                    <img
                      src={featuredImageUpload.url}
                      alt="Featured image preview"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Show existing image if editing and no new upload */}
                {initialData?.featuredImage.url && !form.watch('featuredImage') && !featuredImageUpload.url && (
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

                <FormTextarea
                  control={form.control}
                  name="author.bio"
                  label="Author Bio"
                  placeholder="Short 'About the author' shown at the end of the post"
                  config={{ rows: 4, maxLength: 600, showCharCount: true }}
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

                {/* Upload progress indicator */}
                {avatarUpload.uploading && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading avatar...</span>
                  </div>
                )}

                {/* Upload error */}
                {avatarUpload.error && (
                  <p className="mt-2 text-sm text-destructive">
                    {avatarUpload.error}
                  </p>
                )}

                {/* Show uploaded avatar preview */}
                {avatarUpload.url && !avatarUpload.uploading && (
                  <div className="mt-3">
                    <img
                      src={avatarUpload.url}
                      alt="Author avatar preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}

                {/* Show existing avatar if editing and no new upload */}
                {initialData?.author.avatar?.url && !form.watch('author.avatar') && !avatarUpload.url && (
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
                <CardTitle>
                  Tags <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription>
                  Add tags to categorize your blog (at least 1 required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a tag and press Enter"
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
                  <p className="text-sm text-destructive font-medium">
                    {form.formState.errors.tags.message}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {tags.length}/10 tags added • At least 1 tag required
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

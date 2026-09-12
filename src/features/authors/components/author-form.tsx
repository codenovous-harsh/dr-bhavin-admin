'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authorFormSchema, type Author, type AuthorFormValues } from '@/types/author';
import { authorService } from '@/services/author.service';
import { blogService } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormFileUpload } from '@/components/forms/form-file-upload';
import { FormSwitch } from '@/components/forms/form-switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthorFormProps {
  initialData?: Author;
  mode?: 'create' | 'edit';
}

/**
 * Create / edit an author.
 *
 * Everything here used to live inside the blog form and be re-entered for every
 * post. Editing an author writes through to the byline on all of their existing
 * posts (the backend propagates the change), which is the whole point — one
 * place to fix a bio or swap an avatar.
 */
export function AuthorForm({ initialData, mode = 'create' }: AuthorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertise, setExpertise] = useState<string[]>(initialData?.expertise || []);

  const [avatarUpload, setAvatarUpload] = useState<{
    uploading: boolean;
    url?: string;
    key?: string;
    error?: string;
  }>({
    uploading: false,
    url: initialData?.avatar?.url,
    key: initialData?.avatar?.key
  });

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      title: initialData?.title || 'Author',
      credentialLine: initialData?.credentialLine || '',
      bio: initialData?.bio || '',
      longBio: initialData?.longBio || '',
      avatarUrl: initialData?.avatar?.url || undefined,
      avatarKey: initialData?.avatar?.key || undefined,
      expertise: initialData?.expertise || [],
      socials: {
        linkedin: initialData?.socials?.linkedin || '',
        x: initialData?.socials?.x || '',
        instagram: initialData?.socials?.instagram || '',
        website: initialData?.socials?.website || '',
        email: initialData?.socials?.email || ''
      },
      isActive: initialData?.isActive ?? true,
      metadata: {
        seoTitle: initialData?.metadata?.seoTitle || '',
        seoDescription: initialData?.metadata?.seoDescription || ''
      }
    }
  });

  const addExpertise = () => {
    const value = expertiseInput.trim();
    if (value && !expertise.includes(value) && expertise.length < 10) {
      const next = [...expertise, value];
      setExpertise(next);
      form.setValue('expertise', next, { shouldValidate: true, shouldDirty: true });
      setExpertiseInput('');
    }
  };

  const removeExpertise = (value: string) => {
    const next = expertise.filter((item) => item !== value);
    setExpertise(next);
    form.setValue('expertise', next, { shouldValidate: true, shouldDirty: true });
  };

  // Avatars go through the same /upload/single endpoint as blog images, so the
  // blog service's upload helper is reused rather than duplicated.
  const uploadAvatar = async (file: File) => {
    setAvatarUpload({ uploading: true });

    try {
      const response = await blogService.uploadImage(file);
      const url = response.data?.url;
      const key = response.data?.key;
      if (!url || !key) throw new Error('Invalid upload response');

      setAvatarUpload({ uploading: false, url, key });
      form.setValue('avatarUrl', url, { shouldValidate: true });
      form.setValue('avatarKey', key, { shouldValidate: true });
      toast.success('Avatar uploaded');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setAvatarUpload({ uploading: false, error: error.message || 'Upload failed' });
      toast.error(error.message || 'Failed to upload avatar');
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'avatar' && value.avatar) {
        const file = Array.isArray(value.avatar) ? value.avatar[0] : value.avatar;
        if (file instanceof File) uploadAvatar(file);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: AuthorFormValues) => {
    if (avatarUpload.uploading) {
      toast.error('Please wait for the avatar to finish uploading');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: data.name,
        slug: data.slug || undefined,
        title: data.title || 'Author',
        credentialLine: data.credentialLine || '',
        bio: data.bio || '',
        longBio: data.longBio || '',
        // Only send the avatar when there is one; an unchanged edit must not
        // blank out the existing image.
        ...(avatarUpload.url
          ? { avatar: { url: avatarUpload.url, key: avatarUpload.key || '' } }
          : {}),
        expertise: data.expertise,
        socials: {
          linkedin: data.socials.linkedin || '',
          x: data.socials.x || '',
          instagram: data.socials.instagram || '',
          website: data.socials.website || '',
          email: data.socials.email || ''
        },
        isActive: data.isActive,
        metadata: {
          seoTitle: data.metadata?.seoTitle || '',
          seoDescription: data.metadata?.seoDescription || ''
        }
      };

      if (mode === 'create') {
        await authorService.createAuthor(payload);
        toast.success('Author created');
      } else if (initialData) {
        await authorService.updateAuthor(initialData._id, payload);
        toast.success(
          initialData.postCount
            ? `Author updated — ${initialData.postCount} post${initialData.postCount === 1 ? '' : 's'} refreshed`
            : 'Author updated'
        );
      }

      router.push('/dashboard/authors');
      router.refresh();
    } catch (error: any) {
      console.error('Author form error:', error);
      toast.error(error.message || `Failed to ${mode} author`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAvatar = avatarUpload.url || initialData?.avatar?.url;

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Shown on the byline of every post this author writes, and on their
                public profile page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="e.g. Dr Bhavin Garara"
                required
              />

              <FormInput
                control={form.control}
                name="slug"
                label="Profile URL"
                placeholder="Leave blank to generate from the name"
                description={
                  initialData?.slug
                    ? `Currently /blog/author/${initialData.slug} — changing this redirects the old address.`
                    : 'The profile page lives at /blog/author/<slug>.'
                }
              />

              <FormInput
                control={form.control}
                name="title"
                label="Job title"
                placeholder="e.g. Cosmetic Dermatologist"
              />

              <FormInput
                control={form.control}
                name="credentialLine"
                label="Credentials"
                placeholder="e.g. MBBS, MRCGP · GMC No. 7155707"
                description="Shown under the name on the profile page. Part of the site's E-E-A-T signals for medical content."
              />

              <FormTextarea
                control={form.control}
                name="bio"
                label="Short bio"
                placeholder="One or two sentences, shown in the 'About the author' box at the end of every post"
                config={{ rows: 4, maxLength: 1000, showCharCount: true }}
              />

              <FormTextarea
                control={form.control}
                name="longBio"
                label="Full bio"
                placeholder="The longer version, shown on the profile page only. Leave blank to reuse the short bio."
                config={{ rows: 8, maxLength: 5000, showCharCount: true }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>
                Optional. Blank fields are simply not shown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                control={form.control}
                name="socials.linkedin"
                label="LinkedIn"
                placeholder="https://www.linkedin.com/in/…"
              />
              <FormInput
                control={form.control}
                name="socials.x"
                label="X"
                placeholder="https://x.com/…"
              />
              <FormInput
                control={form.control}
                name="socials.instagram"
                label="Instagram"
                placeholder="https://www.instagram.com/…"
              />
              <FormInput
                control={form.control}
                name="socials.website"
                label="Website"
                placeholder="https://…"
              />
              <FormInput
                control={form.control}
                name="socials.email"
                label="Public email"
                placeholder="name@example.com"
                description="Published on the profile page — use a contact address, not a personal one."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Optional overrides for the profile page's search listing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                control={form.control}
                name="metadata.seoTitle"
                label="SEO title"
                placeholder="Defaults to the name and job title"
              />
              <FormTextarea
                control={form.control}
                name="metadata.seoDescription"
                label="SEO description"
                placeholder="Defaults to the short bio"
                config={{ rows: 3, maxLength: 160, showCharCount: true }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>Square image, up to 2MB.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFileUpload
                control={form.control}
                name="avatar"
                label="Upload"
                config={{
                  maxSize: 2 * 1024 * 1024,
                  maxFiles: 1,
                  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
                }}
              />

              {avatarUpload.uploading && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading…</span>
                </div>
              )}

              {avatarUpload.error && (
                <p className="text-destructive text-sm">{avatarUpload.error}</p>
              )}

              {previewAvatar && !avatarUpload.uploading && (
                <img
                  src={previewAvatar}
                  alt={`${form.watch('name') || 'Author'} avatar`}
                  className="h-24 w-24 rounded-full object-cover"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expertise</CardTitle>
              <CardDescription>
                Topic chips on the profile page. Up to 10.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addExpertise();
                    }
                  }}
                  placeholder="e.g. Skin of colour"
                  disabled={expertise.length >= 10}
                />
                <Button
                  type="button"
                  onClick={addExpertise}
                  disabled={expertise.length >= 10 || !expertiseInput.trim()}
                >
                  Add
                </Button>
              </div>

              {expertise.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {expertise.map((item) => (
                    <Badge key={item} variant="secondary" className="gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeExpertise(item)}
                        className="hover:text-destructive ml-1"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Retires the author: they disappear from the byline picker when writing a post. Their published articles and their profile page stay live — deactivating must never break the links on work already out there. A retired author with nothing published has no public page at all."
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting || avatarUpload.uploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create author' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/authors')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {mode === 'edit' && Boolean(initialData?.postCount) && (
              <p className="text-muted-foreground text-xs">
                Saving updates the byline on {initialData?.postCount} existing post
                {initialData?.postCount === 1 ? '' : 's'}.
              </p>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}

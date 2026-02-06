import { z } from 'zod';

// Blog Author Interface
export interface BlogAuthor {
  name: string;
  avatar?: {
    url?: string;
    key?: string;
  };
  title?: string;
}

// Featured Image Interface
export interface FeaturedImage {
  url: string;
  key: string;
}

// Blog Metadata Interface
export interface BlogMetadata {
  seoTitle?: string;
  seoDescription?: string;
}

// Main Blog Interface
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: FeaturedImage;
  author: BlogAuthor;
  tags: string[];
  readTime: number;
  status: 'draft' | 'published';
  isFeatured: boolean;
  publishedAt: string | null;
  views: number;
  metadata: BlogMetadata;
  createdAt: string;
  updatedAt: string;
}

// Blog List Response Interface
export interface BlogListResponse {
  status: string;
  message: string;
  data: {
    blogs: Blog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBlogs: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Single Blog Response Interface
export interface BlogResponse {
  status: string;
  message: string;
  data: Blog;
}

// Blog Stats Interface
export interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  featuredBlogs: number;
  totalViews: number;
}

// Blog Stats Response Interface
export interface BlogStatsResponse {
  status: string;
  message: string;
  data: BlogStats;
}

// Tags Response Interface
export interface TagsResponse {
  status: string;
  message: string;
  data: string[];
}

// Blog Filters Interface
export interface BlogFilters {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  isFeatured?: boolean;
  tags?: string | string[];
  search?: string;
  sortBy?: string;
}

// Blog Form Data Interface (for creating/updating)
export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: File | null;
  featuredImageUrl?: string;
  featuredImageKey?: string;
  author: {
    name: string;
    avatar?: File | null;
    avatarUrl?: string;
    avatarKey?: string;
    title?: string;
  };
  tags: string[];
  status: 'draft' | 'published';
  isFeatured: boolean;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
  };
}

// Zod Validation Schemas

// Featured Image Schema
const featuredImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  key: z.string().min(1, 'Image key is required')
});

// Author Schema
const authorSchema = z.object({
  name: z
    .string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name cannot exceed 100 characters'),
  avatar: z
    .object({
      url: z.string().url('Invalid avatar URL').optional(),
      key: z.string().optional()
    })
    .optional(),
  title: z
    .string()
    .max(100, 'Author title cannot exceed 100 characters')
    .optional()
});

// Metadata Schema
const metadataSchema = z.object({
  seoTitle: z
    .string()
    .max(60, 'SEO title cannot exceed 60 characters')
    .optional(),
  seoDescription: z
    .string()
    .max(160, 'SEO description cannot exceed 160 characters')
    .optional()
});

// Blog Form Validation Schema
export const blogFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  excerpt: z
    .string()
    .min(20, 'Excerpt must be at least 20 characters')
    .max(500, 'Excerpt cannot exceed 500 characters'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters'),
  featuredImage: z
    .any()
    .refine(
      (files) => {
        if (!files) return false;
        if (files instanceof FileList) return files?.length === 1;
        if (Array.isArray(files)) return files.length === 1;
        return true;
      },
      'Featured image is required'
    )
    .refine(
      (files) => {
        if (!files) return true;
        const file = files instanceof FileList ? files[0] : Array.isArray(files) ? files[0] : files;
        if (!file || typeof file === 'string') return true;
        return file.size <= 5 * 1024 * 1024;
      },
      'Image must be less than 5MB'
    )
    .optional(),
  featuredImageUrl: z.string().url().optional(),
  featuredImageKey: z.string().optional(),
  author: z.object({
    name: z
      .string()
      .min(2, 'Author name must be at least 2 characters')
      .max(100, 'Author name cannot exceed 100 characters'),
    avatar: z
      .any()
      .refine(
        (files) => {
          if (!files) return true;
          if (files instanceof FileList) return files?.length <= 1;
          if (Array.isArray(files)) return files.length <= 1;
          return true;
        },
        'Only one avatar image allowed'
      )
      .refine(
        (files) => {
          if (!files) return true;
          const file = files instanceof FileList ? files[0] : Array.isArray(files) ? files[0] : files;
          if (!file || typeof file === 'string') return true;
          return file.size <= 2 * 1024 * 1024;
        },
        'Avatar must be less than 2MB'
      )
      .optional(),
    avatarUrl: z.string().url().optional(),
    avatarKey: z.string().optional(),
    title: z
      .string()
      .max(100, 'Author title cannot exceed 100 characters')
      .optional()
  }),
  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Cannot have more than 10 tags'),
  status: z.enum(['draft', 'published']),
  isFeatured: z.boolean(),
  metadata: metadataSchema.optional()
});

// Type inference from Zod schema
export type BlogFormValues = z.infer<typeof blogFormSchema>;

// Create Blog API Payload
export interface CreateBlogPayload {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: {
    url: string;
    key: string;
  };
  author: {
    name: string;
    avatar?: {
      url?: string;
      key?: string;
    };
    title?: string;
  };
  tags: string[];
  status: 'draft' | 'published';
  isFeatured: boolean;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
  };
}

// Update Blog API Payload
export interface UpdateBlogPayload extends Partial<CreateBlogPayload> {}

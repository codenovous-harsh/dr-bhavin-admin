import { z } from 'zod';

/**
 * A blog author.
 *
 * Authors used to be free text re-typed into every post (name, title, bio and
 * avatar, per article). They are now records of their own, with a public
 * profile page at /blog/author/<slug> on the website, and a post points at one
 * via `authorId`.
 */
export interface Author {
  _id: string;
  name: string;
  slug: string;
  title?: string;
  credentialLine?: string;
  recognition?: string;
  bio?: string;
  longBio?: string;
  avatar?: {
    url?: string;
    key?: string;
  };
  expertise: string[];
  socials: {
    linkedin?: string;
    x?: string;
    instagram?: string;
    website?: string;
    email?: string;
  };
  isActive: boolean;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
  };
  /** Present on list/detail responses — how many posts this author has. */
  postCount?: number;
  publishedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorListResponse {
  status: string;
  message: string;
  data: {
    authors: Author[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalAuthors: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface AuthorResponse {
  status: string;
  message: string;
  data: Author;
}

// A URL field that is allowed to be blank. z.string().url() rejects '', which
// would make every optional social link a required one.
const optionalUrl = (message: string) =>
  z
    .string()
    .trim()
    .max(500)
    .refine((value) => !value || /^https?:\/\//i.test(value), message)
    .optional();

export const authorFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name cannot exceed 120 characters'),
  slug: z
    .string()
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers and hyphens only')
    .optional(),
  title: z.string().max(120, 'Title cannot exceed 120 characters').optional(),
  credentialLine: z
    .string()
    .max(200, 'Credentials cannot exceed 200 characters')
    .optional(),
  recognition: z
    .string()
    .max(2000, 'Recognition cannot exceed 2000 characters')
    .optional(),
  bio: z.string().max(1000, 'Short bio cannot exceed 1000 characters').optional(),
  longBio: z.string().max(5000, 'Full bio cannot exceed 5000 characters').optional(),
  avatar: z
    .any()
    .refine((files) => {
      if (!files) return true;
      const file = files instanceof FileList ? files[0] : Array.isArray(files) ? files[0] : files;
      if (!file || typeof file === 'string') return true;
      return file.size <= 2 * 1024 * 1024;
    }, 'Avatar must be less than 2MB')
    .optional(),
  avatarUrl: z.string().optional(),
  avatarKey: z.string().optional(),
  expertise: z.array(z.string()).max(10, 'Cannot have more than 10 expertise areas'),
  socials: z.object({
    linkedin: optionalUrl('Enter a full URL starting with https://'),
    x: optionalUrl('Enter a full URL starting with https://'),
    instagram: optionalUrl('Enter a full URL starting with https://'),
    website: optionalUrl('Enter a full URL starting with https://'),
    email: z
      .string()
      .trim()
      .refine((value) => !value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), 'Enter a valid email')
      .optional()
  }),
  isActive: z.boolean(),
  metadata: z
    .object({
      seoTitle: z.string().max(70, 'SEO title cannot exceed 70 characters').optional(),
      seoDescription: z
        .string()
        .max(160, 'SEO description cannot exceed 160 characters')
        .optional()
    })
    .optional()
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;

export interface AuthorPayload {
  name: string;
  slug?: string;
  title?: string;
  credentialLine?: string;
  recognition?: string;
  bio?: string;
  longBio?: string;
  avatar?: { url?: string; key?: string };
  expertise: string[];
  socials: {
    linkedin?: string;
    x?: string;
    instagram?: string;
    website?: string;
    email?: string;
  };
  isActive: boolean;
  metadata?: { seoTitle?: string; seoDescription?: string };
}

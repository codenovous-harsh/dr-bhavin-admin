import api from './auth.service';
import type {
  Blog,
  BlogListResponse,
  BlogResponse,
  BlogStatsResponse,
  TagsResponse,
  BlogFilters,
  CreateBlogPayload,
  UpdateBlogPayload
} from '@/types/blog';

const BLOG_API_URL = '/blogs';

interface UploadResponse {
  status: string;
  message: string;
  data: {
    url: string;
    key: string;
    size: number;
    mimetype: string;
  };
}

class BlogService {
  /**
   * Upload an image to S3
   * @param file - File to upload
   * @returns Upload response with URL and key
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  /**
   * Get all blogs with pagination and filtering
   * @param filters - Filter options
   * @returns List of blogs with pagination info
   */
  async getBlogs(filters?: BlogFilters): Promise<BlogListResponse> {
    const response = await api.get<BlogListResponse>(BLOG_API_URL, {
      params: filters
    });

    return response.data;
  }

  /**
   * Get a single blog by slug
   * @param slug - Blog slug
   * @param incrementView - Whether to increment view count (default: true)
   * @returns Blog data
   */
  async getBlogBySlug(slug: string, incrementView: boolean = true): Promise<Blog> {
    const response = await api.get<BlogResponse>(
      `${BLOG_API_URL}/slug/${slug}`,
      {
        params: { incrementView }
      }
    );

    return response.data.data;
  }

  /**
   * Get a single blog by ID (admin only)
   * @param id - Blog ID
   * @returns Blog data
   */
  async getBlogById(id: string): Promise<Blog> {
    const response = await api.get<BlogResponse>(`${BLOG_API_URL}/${id}`);
    return response.data.data;
  }

  /**
   * Get featured blogs
   * @param limit - Number of featured blogs to fetch (default: 3)
   * @returns List of featured blogs
   */
  async getFeaturedBlogs(limit: number = 3): Promise<Blog[]> {
    const response = await api.get<{ status: string; message: string; data: Blog[] }>(
      `${BLOG_API_URL}/featured/list`,
      {
        params: { limit }
      }
    );

    return response.data.data;
  }

  /**
   * Get all unique tags
   * @returns List of tags
   */
  async getAllTags(): Promise<string[]> {
    const response = await api.get<TagsResponse>(`${BLOG_API_URL}/tags/all`);
    return response.data.data;
  }

  /**
   * Get blog statistics (admin only)
   * @returns Blog statistics
   */
  async getBlogStats(): Promise<BlogStatsResponse['data']> {
    const response = await api.get<BlogStatsResponse>(`${BLOG_API_URL}/stats`);
    return response.data.data;
  }

  /**
   * Create a new blog (admin only)
   * @param blogData - Blog data with pre-uploaded image URLs
   * @returns Created blog
   */
  async createBlog(blogData: {
    title: string;
    excerpt: string;
    content: string;
    featuredImageUrl: string;
    featuredImageKey: string;
    author: {
      name: string;
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
  }): Promise<Blog> {
    try {
      // Prepare payload with pre-uploaded URLs
      const payload: CreateBlogPayload = {
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        featuredImage: {
          url: blogData.featuredImageUrl,
          key: blogData.featuredImageKey
        },
        author: {
          name: blogData.author.name,
          avatar: blogData.author.avatarUrl && blogData.author.avatarKey
            ? {
                url: blogData.author.avatarUrl,
                key: blogData.author.avatarKey
              }
            : undefined,
          title: blogData.author.title || 'Author'
        },
        tags: blogData.tags,
        status: blogData.status,
        isFeatured: blogData.isFeatured,
        metadata: blogData.metadata
      };

      // Create blog
      const response = await api.post<BlogResponse>(BLOG_API_URL, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create blog');
    }
  }

  /**
   * Update a blog (admin only)
   * @param id - Blog ID
   * @param blogData - Updated blog data with pre-uploaded URLs
   * @returns Updated blog
   */
  async updateBlog(
    id: string,
    blogData: {
      title?: string;
      excerpt?: string;
      content?: string;
      featuredImageUrl?: string;
      featuredImageKey?: string;
      author?: {
        name?: string;
        avatarUrl?: string;
        avatarKey?: string;
        title?: string;
      };
      tags?: string[];
      status?: 'draft' | 'published';
      isFeatured?: boolean;
      metadata?: {
        seoTitle?: string;
        seoDescription?: string;
      };
    }
  ): Promise<Blog> {
    try {
      const payload: UpdateBlogPayload = {};

      // Handle featured image update (only if new URLs are provided)
      if (blogData.featuredImageUrl && blogData.featuredImageKey) {
        payload.featuredImage = {
          url: blogData.featuredImageUrl,
          key: blogData.featuredImageKey
        };
      }

      // Handle author update
      if (blogData.author && blogData.author.name) {
        payload.author = {
          name: blogData.author.name,
          title: blogData.author.title
        };

        // Include avatar only if new URLs are provided
        if (blogData.author.avatarUrl && blogData.author.avatarKey) {
          payload.author.avatar = {
            url: blogData.author.avatarUrl,
            key: blogData.author.avatarKey
          };
        }
      }

      // Add other fields
      if (blogData.title) payload.title = blogData.title;
      if (blogData.excerpt) payload.excerpt = blogData.excerpt;
      if (blogData.content) payload.content = blogData.content;
      if (blogData.tags) payload.tags = blogData.tags;
      if (blogData.status) payload.status = blogData.status;
      if (blogData.isFeatured !== undefined) payload.isFeatured = blogData.isFeatured;
      if (blogData.metadata) payload.metadata = blogData.metadata;

      // Update blog
      const response = await api.put<BlogResponse>(`${BLOG_API_URL}/${id}`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update blog');
    }
  }

  /**
   * Delete a blog (admin only)
   * @param id - Blog ID
   * @returns Deleted blog
   */
  async deleteBlog(id: string): Promise<Blog> {
    const response = await api.delete<BlogResponse>(`${BLOG_API_URL}/${id}`);
    return response.data.data;
  }

  /**
   * Publish a blog (admin only)
   * @param id - Blog ID
   * @returns Updated blog
   */
  async publishBlog(id: string): Promise<Blog> {
    const response = await api.patch<BlogResponse>(`${BLOG_API_URL}/${id}/publish`);
    return response.data.data;
  }

  /**
   * Unpublish a blog (admin only)
   * @param id - Blog ID
   * @returns Updated blog
   */
  async unpublishBlog(id: string): Promise<Blog> {
    const response = await api.patch<BlogResponse>(`${BLOG_API_URL}/${id}/unpublish`);
    return response.data.data;
  }

  /**
   * Toggle featured status of a blog (admin only)
   * @param id - Blog ID
   * @returns Updated blog
   */
  async toggleFeatured(id: string): Promise<Blog> {
    const response = await api.patch<BlogResponse>(`${BLOG_API_URL}/${id}/featured`);
    return response.data.data;
  }
}

export const blogService = new BlogService();
export default blogService;

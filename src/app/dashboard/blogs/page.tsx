'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/services/blog.service';
import type { Blog, BlogStats } from '@/types/blog';
import { toast } from 'sonner';
import { Eye, MoreVertical, Star, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/page-container';

export default function BlogsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
    fetchStats();
  }, [activeTab]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const filters: any = {
        limit: 50,
        sortBy: '-publishedAt'
      };

      if (activeTab === 'published') filters.status = 'published';
      if (activeTab === 'draft') filters.status = 'draft';
      if (activeTab === 'featured') filters.isFeatured = true;

      const response = await blogService.getBlogs(filters);
      setBlogs(response.data.blogs);
    } catch (error: any) {
      console.error('Failed to fetch blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await blogService.getBlogStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleDelete = async () => {
    if (!blogToDelete) return;

    try {
      setActionLoading(blogToDelete);
      await blogService.deleteBlog(blogToDelete);
      toast.success('Blog deleted successfully');
      fetchBlogs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete blog');
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      setActionLoading(blog._id);
      if (blog.status === 'published') {
        await blogService.unpublishBlog(blog._id);
        toast.success('Blog unpublished successfully');
      } else {
        await blogService.publishBlog(blog._id);
        toast.success('Blog published successfully');
      }
      fetchBlogs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update blog status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (blog: Blog) => {
    try {
      setActionLoading(blog._id);
      await blogService.toggleFeatured(blog._id);
      toast.success(
        blog.isFeatured
          ? 'Blog removed from featured'
          : 'Blog marked as featured'
      );
      fetchBlogs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (blogId: string) => {
    setBlogToDelete(blogId);
    setDeleteDialogOpen(true);
  };

  return (
    <PageContainer
      pageTitle="Blog Management"
      pageDescription="Manage and publish your blog content"
      pageHeaderAction={
        <Button onClick={() => router.push('/dashboard/blogs/create')}>
          <Icons.add className="mr-2 h-4 w-4" />
          New Post
        </Button>
      }
    >
      <div className="space-y-4">

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Icons.blog className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBlogs || 0}</div>
            <p className="text-muted-foreground text-xs">
              {stats?.publishedBlogs || 0} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalViews.toLocaleString() || 0}
            </div>
            <p className="text-muted-foreground text-xs">
              Across all published posts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
            <Icons.post className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.draftBlogs || 0}</div>
            <p className="text-muted-foreground text-xs">
              Awaiting publication
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Featured Posts
            </CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.featuredBlogs || 0}</div>
            <p className="text-muted-foreground text-xs">
              Highlighted on homepage
            </p>
          </CardContent>
        </Card>
        </div>

        {/* Blog Posts */}
        <Card>
        <CardHeader>
          <div className="flex items-center gap-4 py-2">
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No blogs found matching your search.' : 'No blogs yet. Create your first post!'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBlogs.map((blog) => (
                    <Card key={blog._id} className="overflow-hidden relative">
                      {actionLoading === blog._id && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                      <img
                        src={blog.featuredImage.url}
                        alt={blog.title}
                        className="h-48 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => router.push(`/dashboard/blogs/${blog.slug}`)}
                      />
                      <CardHeader>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                blog.status === 'published'
                                  ? 'default'
                                  : 'secondary'
                              }
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
                        <CardTitle className="line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => router.push(`/dashboard/blogs/${blog.slug}`)}>
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {blog.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-muted-foreground flex items-center justify-between text-sm">
                          <span>{blog.author.name}</span>
                          <span>
                            {blog.publishedAt
                              ? format(new Date(blog.publishedAt), 'MMM dd, yyyy')
                              : format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        {blog.status === 'published' && (
                          <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {blog.views.toLocaleString()} views
                            </span>
                            <span>{blog.readTime} min read</span>
                          </div>
                        )}
                        {blog.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {blog.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {blog.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{blog.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/blogs/edit/${blog._id}`)}
                          >
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/blogs/${blog.slug}`)}
                              >
                                View Post
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/blogs/edit/${blog._id}`)}
                              >
                                Edit Post
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleTogglePublish(blog)}
                              >
                                {blog.status === 'published'
                                  ? 'Unpublish'
                                  : 'Publish'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleFeatured(blog)}
                              >
                                {blog.isFeatured
                                  ? 'Remove from Featured'
                                  : 'Mark as Featured'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => openDeleteDialog(blog._id)}
                              >
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog
              post and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

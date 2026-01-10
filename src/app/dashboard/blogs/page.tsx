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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { useState } from 'react';

// Dummy blog data
const dummyBlogs = [
  {
    id: '1',
    title: '10 Tips for Better Oral Health',
    excerpt:
      'Discover the essential habits that can help you maintain excellent oral health throughout your life...',
    author: 'Dr. Sarah Johnson',
    date: '2024-01-18',
    category: 'Oral Health',
    status: 'published',
    views: 1234,
    image: 'https://via.placeholder.com/400x200'
  },
  {
    id: '2',
    title: 'Understanding Root Canal Treatment',
    excerpt:
      'Learn everything you need to know about root canal procedures, from preparation to recovery...',
    author: 'Dr. Michael Chen',
    date: '2024-01-15',
    category: 'Procedures',
    status: 'published',
    views: 856,
    image: 'https://via.placeholder.com/400x200'
  },
  {
    id: '3',
    title: 'The Future of Cosmetic Dentistry',
    excerpt:
      'Explore the latest innovations and trends shaping the future of cosmetic dental treatments...',
    author: 'Dr. Emily Brown',
    date: '2024-01-12',
    category: 'Cosmetic',
    status: 'draft',
    views: 0,
    image: 'https://via.placeholder.com/400x200'
  },
  {
    id: '4',
    title: "Dental Care for Children: A Parent's Guide",
    excerpt:
      'Essential tips and advice for parents to ensure their children develop healthy dental habits...',
    author: 'Dr. Robert Wilson',
    date: '2024-01-10',
    category: 'Pediatric',
    status: 'published',
    views: 2103,
    image: 'https://via.placeholder.com/400x200'
  },
  {
    id: '5',
    title: 'Teeth Whitening: Myths vs Facts',
    excerpt:
      'Separating fact from fiction when it comes to professional and at-home teeth whitening...',
    author: 'Dr. Lisa Anderson',
    date: '2024-01-08',
    category: 'Cosmetic',
    status: 'published',
    views: 1567,
    image: 'https://via.placeholder.com/400x200'
  },
  {
    id: '6',
    title: 'Managing Dental Anxiety',
    excerpt:
      'Practical strategies to help patients overcome their fear of dental visits...',
    author: 'Dr. James Taylor',
    date: '2024-01-05',
    category: 'Patient Care',
    status: 'review',
    views: 0,
    image: 'https://via.placeholder.com/400x200'
  }
];

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredBlogs = dummyBlogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && blog.status === activeTab;
  });

  const stats = {
    total: dummyBlogs.length,
    published: dummyBlogs.filter((b) => b.status === 'published').length,
    draft: dummyBlogs.filter((b) => b.status === 'draft').length,
    totalViews: dummyBlogs.reduce((acc, blog) => acc + blog.views, 0)
  };

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Blog Management</h2>
        <div className='flex items-center space-x-2'>
          <Button>
            <Icons.add className='mr-2 h-4 w-4' />
            New Post
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Posts</CardTitle>
            <Icons.blog className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-muted-foreground text-xs'>
              {stats.published} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Views</CardTitle>
            <Icons.user className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.totalViews.toLocaleString()}
            </div>
            <p className='text-muted-foreground text-xs'>
              +23% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Draft Posts</CardTitle>
            <Icons.post className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.draft}</div>
            <p className='text-muted-foreground text-xs'>
              Awaiting publication
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Engagement Rate
            </CardTitle>
            <Icons.dashboard className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>4.2%</div>
            <p className='text-muted-foreground text-xs'>
              +1.2% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blog Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Manage and publish your dental health blog content
          </CardDescription>
          <div className='flex items-center gap-4 py-4'>
            <Input
              placeholder='Search posts...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='mb-4'>
              <TabsTrigger value='all'>All Posts</TabsTrigger>
              <TabsTrigger value='published'>Published</TabsTrigger>
              <TabsTrigger value='draft'>Drafts</TabsTrigger>
              <TabsTrigger value='review'>In Review</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredBlogs.map((blog) => (
                  <Card key={blog.id} className='overflow-hidden'>
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className='h-48 w-full object-cover'
                    />
                    <CardHeader>
                      <div className='mb-2 flex items-center justify-between'>
                        <Badge
                          variant={
                            blog.status === 'published'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {blog.status}
                        </Badge>
                        <Badge variant='outline'>{blog.category}</Badge>
                      </div>
                      <CardTitle className='line-clamp-2'>
                        {blog.title}
                      </CardTitle>
                      <CardDescription className='line-clamp-2'>
                        {blog.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='text-muted-foreground flex items-center justify-between text-sm'>
                        <span>{blog.author}</span>
                        <span>{blog.date}</span>
                      </div>
                      {blog.status === 'published' && (
                        <div className='text-muted-foreground mt-2 text-sm'>
                          {blog.views.toLocaleString()} views
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className='flex w-full items-center justify-between'>
                        <Button variant='outline' size='sm'>
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <span className='sr-only'>Open menu</span>
                              <Icons.ellipsis className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Post</DropdownMenuItem>
                            <DropdownMenuItem>Edit Post</DropdownMenuItem>
                            <DropdownMenuItem>
                              {blog.status === 'published'
                                ? 'Unpublish'
                                : 'Publish'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem className='text-red-600'>
                              Delete Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

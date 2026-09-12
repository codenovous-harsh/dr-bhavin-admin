'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, MoreVertical } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { authorService } from '@/services/author.service';
import type { Author } from '@/types/author';

// Optional. Set it and each author row offers a link to their live profile;
// unset, that menu item is simply absent rather than linking somewhere wrong.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function AuthorsPage() {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete flow. An author with posts cannot simply be removed — the byline on
  // every one of those posts points at their profile page — so the dialog asks
  // who inherits them.
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
  const [reassignTo, setReassignTo] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await authorService.getAuthors({ sortBy: 'name' });
      setAuthors(data.authors);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return authors;
    return authors.filter(
      (author) =>
        author.name.toLowerCase().includes(term) ||
        (author.title || '').toLowerCase().includes(term) ||
        author.slug.toLowerCase().includes(term)
    );
  }, [authors, searchTerm]);

  const reassignOptions = authors.filter((a) => a._id !== authorToDelete?._id);
  const needsReassign = Boolean(authorToDelete?.postCount);

  const openDelete = (author: Author) => {
    setAuthorToDelete(author);
    setReassignTo('');
  };

  const handleDelete = async () => {
    if (!authorToDelete) return;
    if (needsReassign && !reassignTo) {
      toast.error('Choose an author to inherit the posts');
      return;
    }

    try {
      setDeleting(true);
      const result = await authorService.deleteAuthor(
        authorToDelete._id,
        needsReassign ? reassignTo : undefined
      );
      toast.success(
        result.reassignedCount
          ? `Author deleted — ${result.reassignedCount} post(s) reassigned`
          : 'Author deleted'
      );
      setAuthorToDelete(null);
      fetchAuthors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete author');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (author: Author) => {
    try {
      await authorService.updateAuthor(author._id, { isActive: !author.isActive });
      toast.success(author.isActive ? 'Author deactivated' : 'Author activated');
      fetchAuthors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update author');
    }
  };

  return (
    <PageContainer
      pageTitle="Authors"
      pageDescription="One profile per writer — used on every byline and published at /blog/author/…"
      pageHeaderAction={
        <Button onClick={() => router.push('/dashboard/authors/create')}>
          <Icons.add className="mr-2 h-4 w-4" />
          New Author
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <Input
            placeholder="Search authors…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No authors match your search.'
                  : 'No authors yet. Create one before writing a post.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Profile URL</TableHead>
                  <TableHead className="text-right">Posts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((author) => (
                  <TableRow key={author._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={author.avatar?.url} alt={author.name} />
                          <AvatarFallback>{initials(author.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{author.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {author.title || 'Author'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      /blog/author/{author.slug}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{author.publishedCount ?? 0}</span>
                      <span className="text-muted-foreground text-xs">
                        {' '}
                        / {author.postCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={author.isActive ? 'default' : 'secondary'}>
                        {author.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                            onClick={() => router.push(`/dashboard/authors/edit/${author._id}`)}
                          >
                            Edit profile
                          </DropdownMenuItem>
                          {SITE_URL && Boolean(author.publishedCount) && (
                            <DropdownMenuItem asChild>
                              <a
                                href={`${SITE_URL}/blog/author/${author.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View public page
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toggleActive(author)}>
                            {author.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDelete(author)}
                          >
                            Delete author
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(authorToDelete)}
        onOpenChange={(open) => !open && setAuthorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {authorToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {needsReassign
                ? `This author has ${authorToDelete?.postCount} post(s). Choose who inherits them — their byline and profile link will be rewritten. Deactivate instead if you only want to stop them appearing in the author picker.`
                : 'This author has no posts and can be removed safely. Their profile page will stop resolving.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {needsReassign && (
            <div className="space-y-2">
              <Select value={reassignTo} onValueChange={setReassignTo}>
                {/* Same w-fit trigger caveat as the byline picker. */}
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Reassign posts to…" />
                </SelectTrigger>
                <SelectContent>
                  {reassignOptions.map((author) => (
                    <SelectItem key={author._id} value={author._id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {reassignOptions.length === 0 && (
                <p className="text-destructive text-sm">
                  There is no other author to reassign to. Create one first, or
                  deactivate this author instead.
                </p>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting || (needsReassign && !reassignTo)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

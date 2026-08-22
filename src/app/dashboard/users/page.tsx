'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UsersTable } from '@/features/users/components/users-table';
import userService from '@/services/user.service';
import { Loader2 } from 'lucide-react';

const EMPTY = {
  name: '',
  email: '',
  password: '',
  role: 'editor' as 'editor' | 'admin'
};

export default function UserManagementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  // Bumped after any mutation so the table refetches the current page rather
  // than mutating a local array that no longer matches the server.
  const [refreshToken, setRefreshToken] = useState(0);
  const refresh = () => setRefreshToken((n) => n + 1);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      await userService.createUser(form);
      toast.success('User created');
      setCreateOpen(false);
      setForm(EMPTY);
      refresh();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not create user';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      pageTitle='User Management'
      pageDescription='Create and manage editor and admin accounts.'
      pageHeaderAction={
        <Button onClick={() => setCreateOpen(true)}>Create user</Button>
      }
    >
      <UsersTable refreshToken={refreshToken} onChanged={refresh} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Editors can manage blogs, enquiries, research and contacts. Admins
              also get patients and AI prompts.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='u-name'>Name</Label>
              <Input
                id='u-name'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='u-email'>Email</Label>
              <Input
                id='u-email'
                type='email'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='u-password'>Temporary password</Label>
              <Input
                id='u-password'
                type='password'
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='u-role'>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm({ ...form, role: v as 'editor' | 'admin' })
                }
                disabled={submitting}
              >
                <SelectTrigger id='u-role'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='editor'>Editor</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className='mr-2 size-4 animate-spin' />}
              Create user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

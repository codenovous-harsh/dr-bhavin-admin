'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!currentPassword) next.currentPassword = 'Current password is required';
    if (newPassword.length < 8)
      next.newPassword = 'New password must be at least 8 characters';
    if (newPassword === currentPassword && newPassword)
      next.newPassword = 'New password must be different from current password';
    if (confirmPassword !== newPassword)
      next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      reset();
      setOpen(false);
    } catch (error: any) {
      const msg = error.message || 'Failed to update password';
      if (/incorrect|current/i.test(msg)) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant='outline'>Update</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='currentPassword'>Current password</Label>
            <Input
              id='currentPassword'
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              autoComplete='current-password'
              required
            />
            {errors.currentPassword && (
              <p className='text-destructive text-sm'>{errors.currentPassword}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='newPassword'>New password</Label>
            <Input
              id='newPassword'
              type='password'
              placeholder='Min 8 characters'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              autoComplete='new-password'
              required
              minLength={8}
            />
            {errors.newPassword && (
              <p className='text-destructive text-sm'>{errors.newPassword}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm new password</Label>
            <Input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              autoComplete='new-password'
              required
              minLength={8}
            />
            {errors.confirmPassword && (
              <p className='text-destructive text-sm'>{errors.confirmPassword}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

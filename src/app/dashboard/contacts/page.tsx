'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContactsTable } from '@/features/contacts/components/contacts-table';
import contactService, { type Contact } from '@/services/contact.service';
import { IconDotsVertical } from '@tabler/icons-react';

function errMessage(e: unknown, fallback: string) {
  return (
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

export default function ContactsPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const refresh = useCallback(() => setRefreshToken((n) => n + 1), []);

  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', name: '' });
  const [bulkText, setBulkText] = useState('');
  const [working, setWorking] = useState(false);

  const handleAdd = async () => {
    if (!addForm.email.trim()) {
      toast.error('Email is required');
      return;
    }
    setWorking(true);
    try {
      await contactService.create({
        email: addForm.email.trim(),
        name: addForm.name.trim()
      });
      toast.success('Contact added');
      setAddOpen(false);
      setAddForm({ email: '', name: '' });
      refresh();
    } catch (e) {
      toast.error(errMessage(e, 'Failed to add contact'));
    } finally {
      setWorking(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) {
      toast.error('Paste some emails first');
      return;
    }
    setWorking(true);
    try {
      const s = await contactService.bulkAdd({ emails: bulkText });
      toast.success(
        `Added ${s.added}, skipped ${s.skipped} existing, ${s.invalid} invalid`
      );
      setBulkOpen(false);
      setBulkText('');
      refresh();
    } catch (e) {
      toast.error(errMessage(e, 'Bulk add failed'));
    } finally {
      setWorking(false);
    }
  };

  /**
   * Both imports behave identically, so they share a runner. The summary is
   * reported in full: `added` alone hides the common case where a run does
   * nothing because everyone is already on the list.
   */
  const runImport = async (
    kind: 'patients' | 'enquiries',
    confirmText: string
  ) => {
    if (!window.confirm(confirmText)) return;
    setWorking(true);
    try {
      const s =
        kind === 'patients'
          ? await contactService.importPatients()
          : await contactService.importEnquiries();

      const parts = [`${s.added} added`];
      if (s.skipped) parts.push(`${s.skipped} already on the list`);
      if (s.invalid) parts.push(`${s.invalid} without a valid email`);

      if (s.added > 0) toast.success(parts.join(' · '));
      else toast.info(`Nothing to add — ${parts.slice(1).join(' · ') || 'no records found'}`);

      refresh();
    } catch (e) {
      toast.error(errMessage(e, `${kind === 'patients' ? 'Patient' : 'Enquiry'} import failed`));
    } finally {
      setWorking(false);
    }
  };

  const handleImportPatients = () =>
    runImport(
      'patients',
      'Import all patient emails from skin analyses into your contact list?'
    );

  const handleImportEnquiries = () =>
    runImport(
      'enquiries',
      'Import everyone who submitted a consultation enquiry into your contact list? Enquiries marked as spam are excluded.'
    );

  const renderActions = useCallback(
    (contact: Contact) => <RowActions contact={contact} onChanged={refresh} />,
    [refresh]
  );

  return (
    <PageContainer
      pageTitle='Contacts'
      pageDescription='Mailing list for blog and clinic updates.'
      pageHeaderAction={
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            onClick={handleImportPatients}
            disabled={working}
          >
            Import patients
          </Button>
          <Button
            variant='outline'
            onClick={handleImportEnquiries}
            disabled={working}
          >
            Import enquiries
          </Button>
          <Button
            variant='outline'
            onClick={() => setBulkOpen(true)}
            disabled={working}
          >
            Bulk add
          </Button>
          <Button onClick={() => setAddOpen(true)} disabled={working}>
            Add contact
          </Button>
        </div>
      }
    >
      <ContactsTable refreshToken={refreshToken} renderActions={renderActions} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className='sm:max-w-[440px]'>
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>
              Adds a single email to the mailing list.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='c-email'>Email</Label>
              <Input
                id='c-email'
                type='email'
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                disabled={working}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='c-name'>Name (optional)</Label>
              <Input
                id='c-name'
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                disabled={working}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setAddOpen(false)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={working}>
              {working && <Loader2 className='mr-2 size-4 animate-spin' />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className='sm:max-w-[560px]'>
          <DialogHeader>
            <DialogTitle>Bulk add contacts</DialogTitle>
            <DialogDescription>
              One email per line, or comma-separated. Existing and invalid
              addresses are skipped.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={10}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'someone@example.com\nanother@example.com'}
            disabled={working}
          />
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setBulkOpen(false)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAdd} disabled={working}>
              {working && <Loader2 className='mr-2 size-4 animate-spin' />}
              Add emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function RowActions({
  contact,
  onChanged
}: {
  contact: Contact;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      toast.success(label);
      onChanged();
    } catch (e) {
      toast.error(errMessage(e, `Could not ${label.toLowerCase()}`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-8'
          disabled={busy}
          aria-label={`Actions for ${contact.email}`}
        >
          <IconDotsVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() =>
            run(contact.subscribed ? 'Unsubscribed' : 'Resubscribed', () =>
              contactService.update(contact._id, {
                subscribed: !contact.subscribed
              })
            )
          }
        >
          {contact.subscribed ? 'Unsubscribe' : 'Resubscribe'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onClick={() => {
            if (!window.confirm(`Remove ${contact.email} from the list?`))
              return;
            void run('Contact removed', () =>
              contactService.remove(contact._id)
            );
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

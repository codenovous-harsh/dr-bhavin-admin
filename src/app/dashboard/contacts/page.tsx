'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import contactService, { type Contact } from '@/services/contact.service';

const SOURCE_LABEL: Record<Contact['source'], string> = {
  manual: 'Manual',
  bulk: 'Bulk',
  patient_import: 'Patient',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', name: '' });

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await contactService.list({ limit: 500, search: search || undefined });
      setContacts(result.contacts);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleAdd = async () => {
    if (!addForm.email.trim()) {
      toast.error('Email is required');
      return;
    }
    setWorking(true);
    try {
      await contactService.create({ email: addForm.email.trim(), name: addForm.name.trim() });
      toast.success('Contact added');
      setAddOpen(false);
      setAddForm({ email: '', name: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add contact');
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
      const summary = await contactService.bulkAdd({ emails: bulkText });
      toast.success(
        `Added ${summary.added}, skipped ${summary.skipped} existing, ${summary.invalid} invalid`
      );
      setBulkOpen(false);
      setBulkText('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk add failed');
    } finally {
      setWorking(false);
    }
  };

  const handleImportPatients = async () => {
    if (!confirm('Import all patient emails from skin analyses into your contact list?')) return;
    setWorking(true);
    try {
      const summary = await contactService.importPatients();
      toast.success(
        `Imported ${summary.added} new patient emails (${summary.skipped} already in list)`
      );
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Patient import failed');
    } finally {
      setWorking(false);
    }
  };

  const handleToggleSubscribed = async (contact: Contact) => {
    try {
      await contactService.update(contact._id, { subscribed: !contact.subscribed });
      toast.success(contact.subscribed ? 'Unsubscribed' : 'Resubscribed');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update contact');
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (!confirm(`Delete ${contact.email}?`)) return;
    try {
      await contactService.remove(contact._id);
      toast.success('Contact deleted');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the email list used for sending blogs and announcements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportPatients} disabled={working}>
            Import patients
          </Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)} disabled={working}>
            Bulk add
          </Button>
          <Button onClick={() => setAddOpen(true)} disabled={working}>
            Add contact
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name…"
              className="max-w-sm"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.email}</TableCell>
                    <TableCell>{c.name || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{SOURCE_LABEL[c.source] || c.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.subscribed ? 'default' : 'secondary'}>
                        {c.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleToggleSubscribed(c)}>
                          {c.subscribed ? 'Unsubscribe' : 'Subscribe'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add single */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>Add one email to the list.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="c-email">Email</Label>
              <Input
                id="c-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="c-name">Name (optional)</Label>
              <Input
                id="c-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={working}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={working}>
              {working ? 'Adding…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk add */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk add contacts</DialogTitle>
            <DialogDescription>
              Paste emails separated by commas, spaces, semicolons, or newlines. Invalid and
              duplicate addresses are skipped.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              placeholder={'alice@example.com\nbob@example.com, carol@example.com\ndave@example.com'}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)} disabled={working}>
              Cancel
            </Button>
            <Button onClick={handleBulkAdd} disabled={working}>
              {working ? 'Adding…' : 'Add all'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

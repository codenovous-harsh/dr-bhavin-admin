'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import contactService, { type Contact } from '@/services/contact.service';
import { blogService } from '@/services/blog.service';

interface SendBlogEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogId: string;
  blogTitle: string;
}

export default function SendBlogEmailDialog({
  open,
  onOpenChange,
  blogId,
  blogTitle,
}: SendBlogEmailDialogProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  // True number of subscribers, from the server. The picker below only holds
  // one page, so `contacts.length` is not the audience size.
  const [subscriberTotal, setSubscriberTotal] = useState(0);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [includeAll, setIncludeAll] = useState(false);
  const [extraEmails, setExtraEmails] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set());
    setIncludeAll(false);
    setExtraEmails('');
    setSearch('');
    loadContacts();
  }, [open]);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      // List endpoints cap `limit` server-side (utils/query MAX_LIMIT), so this
      // is one page for the picker — not the whole audience. "Send to all" is
      // resolved server-side from `includeAllContacts`, so the send is complete
      // regardless of what's loaded here; only the displayed counts need the
      // real total, which comes from the pagination envelope.
      const result = await contactService.list({
        limit: 100,
        subscribedOnly: true
      });
      setContacts(result.contacts);
      setSubscriberTotal(result.pagination.total ?? result.contacts.length);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) => c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const toggleContact = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = filteredContacts.every((c) => next.has(c._id));
      if (allSelected) {
        filteredContacts.forEach((c) => next.delete(c._id));
      } else {
        filteredContacts.forEach((c) => next.add(c._id));
      }
      return next;
    });
  };

  const adHocCount = useMemo(() => {
    if (!extraEmails.trim()) return 0;
    const list = extraEmails
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return new Set(list).size;
  }, [extraEmails]);

  const totalSelected = includeAll
    ? subscriberTotal + adHocCount
    : selectedIds.size + adHocCount;

  const handleSend = async () => {
    if (totalSelected === 0) {
      toast.error('Select at least one recipient');
      return;
    }
    if (!confirm(`Send "${blogTitle}" to ${totalSelected} recipient(s)?`)) return;

    setSending(true);
    try {
      const res = await blogService.sendBlogEmail(blogId, {
        contactIds: includeAll ? undefined : Array.from(selectedIds),
        extraEmails: extraEmails || undefined,
        includeAllContacts: includeAll || undefined,
      });
      const { success, failure, total } = res.data;
      if (failure === 0) {
        toast.success(`Sent to all ${success} recipients`);
      } else {
        toast.warning(`Sent to ${success}/${total}. ${failure} failed.`);
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send blog email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email blog post</DialogTitle>
          <DialogDescription className="line-clamp-1">
            Sending: <span className="font-medium">{blogTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Recipients from contact list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Contact list</Label>
              <Badge variant="outline">
                {includeAll ? `All ${subscriberTotal}` : `${selectedIds.size} selected`}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="include-all"
                checked={includeAll}
                onCheckedChange={(v) => setIncludeAll(!!v)}
              />
              <Label htmlFor="include-all" className="cursor-pointer text-sm font-normal">
                Send to all subscribed contacts ({subscriberTotal})
              </Label>
            </div>

            {!includeAll && subscriberTotal > contacts.length && (
              <p className="text-muted-foreground text-xs">
                Showing the first {contacts.length} of {subscriberTotal}{' '}
                subscribers. Use &ldquo;Send to all&rdquo; to reach everyone.
              </p>
            )}

            {!includeAll && (
              <div className="border rounded-md">
                <div className="flex items-center gap-2 p-2 border-b">
                  <Input
                    placeholder="Search contacts…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleAllFiltered}
                    disabled={filteredContacts.length === 0}
                  >
                    Toggle visible
                  </Button>
                </div>
                <div className="max-h-56 overflow-y-auto p-2 space-y-1">
                  {loadingContacts ? (
                    <p className="text-sm text-muted-foreground p-2">Loading…</p>
                  ) : filteredContacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">
                      {contacts.length === 0
                        ? 'No contacts yet. Add some from the Contacts page or paste emails below.'
                        : 'No matches.'}
                    </p>
                  ) : (
                    filteredContacts.map((c) => (
                      <label
                        key={c._id}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedIds.has(c._id)}
                          onCheckedChange={() => toggleContact(c._id)}
                        />
                        <span className="text-sm truncate">
                          {c.name ? `${c.name} ` : ''}
                          <span className="text-muted-foreground">{c.email}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ad-hoc emails */}
          <div className="space-y-2">
            <Label htmlFor="extra-emails">
              Additional emails <span className="text-muted-foreground">(comma, space, or newline separated)</span>
            </Label>
            <Textarea
              id="extra-emails"
              value={extraEmails}
              onChange={(e) => setExtraEmails(e.target.value)}
              placeholder="alice@example.com, bob@example.com&#10;carol@example.com"
              rows={4}
              disabled={sending}
            />
            {adHocCount > 0 && (
              <p className="text-xs text-muted-foreground">{adHocCount} unique address(es) detected</p>
            )}
          </div>

          <div className="rounded-md border p-3 bg-muted/30">
            <p className="text-sm">
              <span className="font-medium">{totalSelected}</span> total recipient(s) will receive this blog.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || totalSelected === 0}>
            {sending ? 'Sending…' : `Send to ${totalSelected}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

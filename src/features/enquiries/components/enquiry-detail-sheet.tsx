'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format-date';
import enquiryService from '@/services/enquiry.service';
import {
  ENQUIRY_STATUSES,
  type Enquiry,
  type EnquiryActivity,
  type EnquiryStatus
} from '@/types/enquiry';

function errorMessage(e: unknown, fallback: string) {
  return (
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    (e as Error)?.message ??
    fallback
  );
}

/** Absolute date and time — a case history needs both, not "3 days ago". */
function stamp(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <dt className='text-muted-foreground text-xs tracking-wide uppercase'>
        {label}
      </dt>
      <dd className='text-sm break-words'>{children}</dd>
    </div>
  );
}

function ActivityEntry({ entry }: { entry: EnquiryActivity }) {
  const who = entry.authorName || 'Unknown';
  return (
    <li className='border-border border-l-2 py-1 pl-3'>
      <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
        {entry.type === 'status' ? (
          <span className='text-sm font-medium'>
            {entry.fromStatus || '—'} &rarr; {entry.toStatus}
          </span>
        ) : (
          <span className='text-sm font-medium'>Note</span>
        )}
        <span className='text-muted-foreground text-xs'>
          {who} · {stamp(entry.createdAt)}
        </span>
      </div>
      {entry.body ? (
        <p className='mt-1 text-sm whitespace-pre-wrap'>{entry.body}</p>
      ) : entry.type === 'status' ? (
        <p className='text-muted-foreground mt-1 text-sm italic'>
          No reason recorded
        </p>
      ) : null}
    </li>
  );
}

/**
 * Full enquiry with its case history.
 *
 * Exists because the list view showed everything about an enquiry except the
 * one thing the patient actually wrote, and because a status column records
 * what was decided while losing why. The reason is the part worth keeping — six
 * months on, "closed" tells you nothing and "closed — attended consultation,
 * declined treatment on cost" tells you everything.
 *
 * Fetched per open rather than passed down from the table: the list endpoint
 * does not return activity, and sending every enquiry's full history to render
 * a table would be wasteful for data almost none of it displays.
 */
export function EnquiryDetailSheet({
  enquiryId,
  open,
  onOpenChange,
  onChanged
}: {
  enquiryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires after any write, so the table behind can refetch. */
  onChanged?: () => void;
}) {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  // The status the dropdown is showing, which is not yet the saved status.
  // Selecting used to commit immediately, which made the reason box beside it
  // useless — by the time you had typed anything the change had already gone.
  const [pendingStatus, setPendingStatus] = useState<EnquiryStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!enquiryId) return;
    setLoading(true);
    try {
      setEnquiry(await enquiryService.getById(enquiryId));
    } catch (e: unknown) {
      toast.error(errorMessage(e, 'Could not load this enquiry'));
    } finally {
      setLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    if (open && enquiryId) {
      setNote('');
      setReason('');
      setPendingStatus(null);
      load();
    }
  }, [open, enquiryId, load]);

  const saveNote = async () => {
    if (!enquiryId || !note.trim()) return;
    setBusy(true);
    try {
      setEnquiry(await enquiryService.addNote(enquiryId, note.trim()));
      setNote('');
      toast.success('Note added');
      onChanged?.();
    } catch (e: unknown) {
      toast.error(errorMessage(e, 'Could not add the note'));
    } finally {
      setBusy(false);
    }
  };

  const commitStatus = async () => {
    if (!enquiryId || !pendingStatus || pendingStatus === enquiry?.status) return;
    setBusy(true);
    try {
      setEnquiry(
        await enquiryService.updateStatus(enquiryId, pendingStatus, reason.trim())
      );
      setReason('');
      setPendingStatus(null);
      toast.success(`Marked as ${pendingStatus}`);
      onChanged?.();
      // Closing is the confirmation: a status change is the end of a piece of
      // work, and the refreshed row behind shows the result. Only on success —
      // closing on failure would hide the error toast's context and lose the
      // reason the user had just typed.
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(errorMessage(e, 'Could not update the status'));
    } finally {
      setBusy(false);
    }
  };

  const activity = enquiry?.activity ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl'
      >
        <SheetHeader className='pb-2'>
          <SheetTitle>{enquiry?.name ?? 'Enquiry'}</SheetTitle>
          <SheetDescription>
            {enquiry
              ? `Received ${stamp(enquiry.createdAt)}`
              : 'Loading enquiry…'}
          </SheetDescription>
        </SheetHeader>

        {loading && !enquiry ? (
          <p className='text-muted-foreground px-4 py-6 text-sm'>Loading…</p>
        ) : !enquiry ? null : (
          <div className='flex flex-col gap-6 px-4 pb-8'>
            {/* ---- what they told us ---- */}
            <dl className='grid grid-cols-2 gap-x-4 gap-y-3'>
              <Field label='Email'>
                <a
                  href={`mailto:${enquiry.email}`}
                  className='underline underline-offset-2'
                >
                  {enquiry.email}
                </a>
              </Field>
              <Field label='Status'>
                <Badge variant='secondary' className='capitalize'>
                  {enquiry.status}
                </Badge>
              </Field>
              {enquiry.concern ? (
                <Field label='Concern'>{enquiry.concern}</Field>
              ) : null}
              {enquiry.consultationFormat ? (
                <Field label='Format'>{enquiry.consultationFormat}</Field>
              ) : null}
              {enquiry.appointmentType ? (
                <Field label='Appointment'>{enquiry.appointmentType}</Field>
              ) : null}
              {enquiry.preferredClinic ? (
                <Field label='Clinic'>{enquiry.preferredClinic}</Field>
              ) : null}
              {enquiry.sourceTitle || enquiry.sourcePath ? (
                <div className='col-span-2'>
                  <Field label='Enquired from'>
                    {enquiry.sourceTitle || enquiry.sourcePath}
                  </Field>
                </div>
              ) : null}
            </dl>

            {/* ---- the message: the reason this panel exists ---- */}
            <section>
              <h3 className='mb-2 text-sm font-medium'>Their message</h3>
              {enquiry.notes?.trim() ? (
                <p className='bg-muted rounded-md p-3 text-sm whitespace-pre-wrap'>
                  {enquiry.notes}
                </p>
              ) : (
                <p className='text-muted-foreground text-sm italic'>
                  They didn&apos;t leave a message.
                </p>
              )}
            </section>

            {/* ---- case history ---- */}
            <section>
              <h3 className='mb-2 text-sm font-medium'>
                Case history{' '}
                <span className='text-muted-foreground font-normal'>
                  ({activity.length})
                </span>
              </h3>
              {activity.length ? (
                <ul className='flex flex-col gap-3'>
                  {activity.map((entry, i) => (
                    <ActivityEntry key={`${entry.createdAt}-${i}`} entry={entry} />
                  ))}
                </ul>
              ) : (
                <p className='text-muted-foreground text-sm italic'>
                  Nothing recorded yet.
                </p>
              )}
            </section>

            {/* ---- add to it ---- */}
            <section className='border-border flex flex-col gap-2 border-t pt-4'>
              <label htmlFor='enquiry-note' className='text-sm font-medium'>
                Add a note
              </label>
              <Textarea
                id='enquiry-note'
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='What was discussed, what was agreed, what happens next.'
              />
              <div>
                <Button
                  size='sm'
                  disabled={busy || !note.trim()}
                  onClick={saveNote}
                >
                  Save note
                </Button>
              </div>
            </section>

            <section className='border-border flex flex-col gap-2 border-t pt-4'>
              <label htmlFor='enquiry-reason' className='text-sm font-medium'>
                Change status
              </label>
              <p className='text-muted-foreground text-xs'>
                The reason is optional, and it is the part worth writing — the
                status alone won&apos;t tell you anything later.
              </p>
              <Textarea
                id='enquiry-reason'
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='Why is it moving? e.g. booked in for 14th, or not proceeding on cost.'
              />
              <div className='flex flex-wrap items-center gap-2'>
                <Select
                  value={pendingStatus ?? enquiry.status}
                  onValueChange={(v) => setPendingStatus(v as EnquiryStatus)}
                  disabled={busy}
                >
                  <SelectTrigger className='w-[180px]' aria-label='Change status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENQUIRY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className='capitalize'>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size='sm'
                  disabled={
                    busy || !pendingStatus || pendingStatus === enquiry.status
                  }
                  onClick={commitStatus}
                >
                  Update status
                </Button>
                {pendingStatus && pendingStatus !== enquiry.status ? (
                  <span className='text-muted-foreground text-xs'>
                    {enquiry.status} &rarr; {pendingStatus}, not saved yet
                  </span>
                ) : null}
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

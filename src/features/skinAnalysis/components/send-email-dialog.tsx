'use client';

import { useState } from 'react';
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
import skinAnalysisService from '@/services/skinAnalysis.service';

interface EmailHistoryEntry {
  sentAt: string;
  subject: string;
  type?: 'auto' | 'manual';
  error?: string | null;
}

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  patientName: string;
  patientEmail: string;
  emailHistory?: EmailHistoryEntry[];
  onSent?: (history: EmailHistoryEntry[]) => void;
}

export default function SendEmailDialog({
  open,
  onOpenChange,
  analysisId,
  patientName,
  patientEmail,
  emailHistory = [],
  onSent,
}: SendEmailDialogProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSending(true);
    try {
      const res = await skinAnalysisService.sendPatientEmail(analysisId, {
        subject: subject.trim(),
        message: message.trim(),
      });
      toast.success(`Email sent to ${patientEmail}`);
      setSubject('');
      setMessage('');
      onSent?.(res.data.emailHistory || []);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Email {patientName}</DialogTitle>
          <DialogDescription>
            Sending to <span className="font-medium">{patientEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Follow-up on your skin analysis"
              disabled={sending}
            />
          </div>
          <div>
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
              rows={8}
              disabled={sending}
            />
          </div>

          {emailHistory.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">Email history</p>
              <ul className="space-y-1 max-h-32 overflow-auto text-xs text-muted-foreground">
                {emailHistory
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <li key={idx} className="flex justify-between gap-2">
                      <span className="truncate">
                        {entry.type === 'auto' ? '🤖' : '✉️'} {entry.subject}
                      </span>
                      <span className="shrink-0">
                        {new Date(entry.sentAt).toLocaleString()}
                        {entry.error ? ' (failed)' : ''}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

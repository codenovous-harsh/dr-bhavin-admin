'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import enquiryService from '@/services/enquiry.service';
import type { Enquiry, EnquiryStatus } from '@/types/enquiry';

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'text-green-700 bg-green-100',
  contacted: 'text-amber-700 bg-amber-100',
  closed: 'text-muted-foreground bg-muted',
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await enquiryService.list({ limit: 100 });
      setEnquiries(data.enquiries);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: string, status: EnquiryStatus) {
    const prev = enquiries;
    setEnquiries((list) => list.map((e) => (e._id === id ? { ...e, status } : e)));
    try {
      await enquiryService.updateStatus(id, status);
    } catch {
      setEnquiries(prev); // revert on failure
    }
  }

  const newCount = enquiries.filter((e) => e.status === 'new').length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Consultation Enquiries</h1>
        <p className="text-sm text-muted-foreground">
          Requests submitted from the website consultation form.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enquiries</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading…'
              : `${enquiries.length} total · ${newCount} new`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading enquiries…</p>
          ) : error ? (
            <p className="p-6 text-sm text-red-600">{error}</p>
          ) : enquiries.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Concern</th>
                  <th className="px-4 py-3 font-medium">Format</th>
                  <th className="px-4 py-3 font-medium">Clinic</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e._id} className="border-b last:border-0 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(e.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${e.email}`} className="text-primary hover:underline">
                        {e.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">{e.concern || '—'}</td>
                    <td className="px-4 py-3">{e.consultationFormat || '—'}</td>
                    <td className="px-4 py-3">{e.preferredClinic || '—'}</td>
                    <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                      {e.notes ? (
                        <span className="line-clamp-3" title={e.notes}>
                          {e.notes}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={e.status}
                        onValueChange={(v) => changeStatus(e._id, v as EnquiryStatus)}
                      >
                        <SelectTrigger
                          className={`h-8 w-[130px] border-0 text-xs font-medium ${STATUS_STYLES[e.status]}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

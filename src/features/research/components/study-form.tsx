'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import researchService, { type ResearchStudy } from '@/services/research.service';

/**
 * Create/edit a research study.
 *
 * The governance section is separated out and labelled as required for
 * publishing on purpose. The pre-launch audit found studies advertising
 * recruitment with no sponsor, approvals, risk statement, withdrawal rights or
 * complaints route (WEB-027/WEB-028) — the backend refuses to publish without
 * them, and this form makes that visible before someone tries.
 */

type FormState = {
  title: string;
  summary: string;
  description: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  commitment: string;
  compensation: string;
  recruitmentStatus: string;
  displayOrder: string;
  capacity: string;

  sponsor: string;
  classification: string;
  protocolRef: string;
  approvalBody: string;
  approvalReference: string;
  approvalDate: string;
  participantInfoUrl: string;
  risks: string;
  withdrawalRights: string;
  dataHandling: string;
  complaintsRoute: string;
};

const EMPTY: FormState = {
  title: '',
  summary: '',
  description: '',
  inclusionCriteria: '',
  exclusionCriteria: '',
  commitment: '',
  compensation: '',
  recruitmentStatus: 'recruiting',
  displayOrder: '0',
  capacity: '',
  sponsor: '',
  classification: '',
  protocolRef: '',
  approvalBody: '',
  approvalReference: '',
  approvalDate: '',
  participantInfoUrl: '',
  risks: '',
  withdrawalRights: '',
  dataHandling: '',
  complaintsRoute: ''
};

const linesToArray = (v: string) =>
  v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

export default function StudyForm({ studyId }: { studyId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [study, setStudy] = useState<ResearchStudy | null>(null);
  const [loading, setLoading] = useState(Boolean(studyId));
  const [saving, setSaving] = useState<'save' | 'publish' | null>(null);

  useEffect(() => {
    if (!studyId) return;
    (async () => {
      try {
        const s = await researchService.getStudy(studyId);
        setStudy(s);
        setForm({
          title: s.title ?? '',
          summary: s.summary ?? '',
          description: s.description ?? '',
          inclusionCriteria: (s.inclusionCriteria ?? []).join('\n'),
          exclusionCriteria: (s.exclusionCriteria ?? []).join('\n'),
          commitment: s.commitment ?? '',
          compensation: s.compensation ?? '',
          recruitmentStatus: s.recruitmentStatus ?? 'recruiting',
          displayOrder: String(s.displayOrder ?? 0),
          capacity: s.capacity ? String(s.capacity) : '',
          sponsor: s.sponsor ?? '',
          classification: s.classification ?? '',
          protocolRef: s.protocolRef ?? '',
          approvalBody: s.approvalBody ?? '',
          approvalReference: s.approvalReference ?? '',
          approvalDate: s.approvalDate ? s.approvalDate.slice(0, 10) : '',
          participantInfoUrl: s.participantInfoUrl ?? '',
          risks: s.risks ?? '',
          withdrawalRights: s.withdrawalRights ?? '',
          dataHandling: s.dataHandling ?? '',
          complaintsRoute: s.complaintsRoute ?? ''
        });
      } catch {
        toast.error('Could not load that study');
      } finally {
        setLoading(false);
      }
    })();
  }, [studyId]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await save(false);
  }

  /**
   * @param publishAfter - Save, then publish in the same action. On a new study
   *   this needs the id the create call returns, which is why publishing cannot
   *   simply be a second button the editor presses on the list afterwards.
   */
  async function save(publishAfter: boolean) {
    if (saving) return;
    if (!form.title.trim()) {
      toast.error('A title is required');
      return;
    }
    setSaving(publishAfter ? 'publish' : 'save');
    const payload = {
      ...form,
      inclusionCriteria: linesToArray(form.inclusionCriteria),
      exclusionCriteria: linesToArray(form.exclusionCriteria),
      displayOrder: Number(form.displayOrder) || 0,
      capacity: form.capacity ? Number(form.capacity) : null,
      approvalDate: form.approvalDate || null
    };

    try {
      const saved = studyId
        ? await researchService.updateStudy(studyId, payload as never)
        : await researchService.createStudy(payload as never);
      setStudy(saved);
      const stillMissing = saved.missingGovernanceFields ?? [];

      if (publishAfter) {
        // Governance is incomplete: the study is saved, but stay on the form so
        // the missing fields can be filled in straight away rather than making
        // the editor navigate back here to find out what was wrong.
        if (stillMissing.length > 0) {
          toast.error('Saved as a draft — it cannot be published yet', {
            description: `Still needed: ${stillMissing.join(', ')}`,
            duration: 10000
          });
          if (!studyId) router.replace(`/dashboard/research/${saved.id}`);
          return;
        }

        const result = await researchService.publishStudy(saved.id);
        if (!result.ok) {
          toast.error(result.message, {
            description: `Still needed: ${result.missing.join(', ')}`,
            duration: 10000
          });
          if (!studyId) router.replace(`/dashboard/research/${saved.id}`);
          return;
        }
        toast.success('Study published — it is now live on the website');
        router.push('/dashboard/research');
        return;
      }

      // Return to the list on success, matching the blog editor. The governance
      // warning lives on the list card too, but it is carried into the toast so
      // navigating away does not lose the reason a study still cannot publish.
      toast.success(studyId ? 'Study saved' : 'Study created', {
        description: stillMissing.length
          ? `Not publishable yet — still needed: ${stillMissing.join(', ')}`
          : undefined,
        duration: stillMissing.length ? 8000 : 4000
      });
      router.push('/dashboard/research');
    } catch {
      toast.error('Could not save the study');
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p className='text-muted-foreground p-6 text-sm'>Loading…</p>;

  const missing = study?.missingGovernanceFields ?? [];
  const isPublished = study?.status === 'published';

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-4 md:p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {studyId ? 'Edit study' : 'New study'}
          </h1>
          {study && (
            <p className='text-muted-foreground text-sm'>
              /{study.slug} · {study.status} · participant info v{study.infoSheetVersion}
            </p>
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button type='button' variant='outline' onClick={() => router.push('/dashboard/research')}>
            Back
          </Button>
          <Button type='submit' variant={isPublished ? 'default' : 'outline'} disabled={saving !== null}>
            {saving === 'save' ? 'Saving…' : 'Save'}
          </Button>
          {/* A published study is already live, so saving is the whole action. */}
          {!isPublished && (
            <Button type='button' disabled={saving !== null} onClick={() => save(true)}>
              {saving === 'publish' ? 'Publishing…' : 'Save & publish'}
            </Button>
          )}
        </div>
      </div>

      {study && missing.length > 0 && (
        <div className='rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground'>
          <p className='font-medium'>This study cannot be published yet.</p>
          <p className='mt-1'>Complete these governance fields first: {missing.join(', ')}.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Study details</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <Field label='Title' required>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label='Summary' hint='One or two sentences shown on the card.'>
            <Textarea rows={2} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
          </Field>
          <Field label='Description'>
            <Textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label='Eligibility criteria' hint='One per line.'>
            <Textarea rows={4} value={form.inclusionCriteria} onChange={(e) => set('inclusionCriteria', e.target.value)} />
          </Field>
          <Field label='Exclusion criteria' hint='One per line. Shown as "You cannot take part if".'>
            <Textarea rows={3} value={form.exclusionCriteria} onChange={(e) => set('exclusionCriteria', e.target.value)} />
          </Field>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field label='Commitment'>
              <Input value={form.commitment} onChange={(e) => set('commitment', e.target.value)} placeholder='3 visits over 12 weeks' />
            </Field>
            <Field label='Compensation'>
              <Input value={form.compensation} onChange={(e) => set('compensation', e.target.value)} />
            </Field>
          </div>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Field label='Recruitment status'>
              <Select value={form.recruitmentStatus} onValueChange={(v) => set('recruitmentStatus', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='recruiting'>Recruiting</SelectItem>
                  <SelectItem value='closed'>Closed</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label='Display order'>
              <Input type='number' value={form.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} />
            </Field>
            <Field label='Capacity' hint='Optional. Closes applications when reached.'>
              <Input type='number' value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Governance</CardTitle>
          <p className='text-muted-foreground text-sm'>
            All of these are required before the study can appear on the public site. Editing the
            participant-facing fields bumps the information-sheet version, so applications keep a
            record of what each volunteer actually consented to.
          </p>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field label='Sponsor' required>
              <Input value={form.sponsor} onChange={(e) => set('sponsor', e.target.value)} />
            </Field>
            <Field label='Project classification' required>
              <Select value={form.classification} onValueChange={(v) => set('classification', v)}>
                <SelectTrigger><SelectValue placeholder='Select…' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='research'>Research</SelectItem>
                  <SelectItem value='service_evaluation'>Service evaluation</SelectItem>
                  <SelectItem value='audit'>Audit</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Field label='Protocol reference' required>
              <Input value={form.protocolRef} onChange={(e) => set('protocolRef', e.target.value)} />
            </Field>
            <Field label='Approving body' required>
              <Input value={form.approvalBody} onChange={(e) => set('approvalBody', e.target.value)} placeholder='NHS HRA' />
            </Field>
            <Field label='Approval reference' required>
              <Input value={form.approvalReference} onChange={(e) => set('approvalReference', e.target.value)} />
            </Field>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field label='Approval date'>
              <Input type='date' value={form.approvalDate} onChange={(e) => set('approvalDate', e.target.value)} />
            </Field>
            <Field label='Participant information sheet URL' required>
              <Input value={form.participantInfoUrl} onChange={(e) => set('participantInfoUrl', e.target.value)} placeholder='https://…' />
            </Field>
          </div>
          <Field label='Risks' required hint='What could go wrong, in plain language.'>
            <Textarea rows={3} value={form.risks} onChange={(e) => set('risks', e.target.value)} />
          </Field>
          <Field label='Right to withdraw' required>
            <Textarea rows={2} value={form.withdrawalRights} onChange={(e) => set('withdrawalRights', e.target.value)} />
          </Field>
          <Field label='How data is handled' required>
            <Textarea rows={2} value={form.dataHandling} onChange={(e) => set('dataHandling', e.target.value)} />
          </Field>
          <Field label='Complaints route' required>
            <Textarea rows={2} value={form.complaintsRoute} onChange={(e) => set('complaintsRoute', e.target.value)} />
          </Field>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='grid gap-1.5'>
      <Label>
        {label}
        {required && <span className='text-destructive ml-1'>*</span>}
      </Label>
      {children}
      {hint && <p className='text-muted-foreground text-xs'>{hint}</p>}
    </div>
  );
}

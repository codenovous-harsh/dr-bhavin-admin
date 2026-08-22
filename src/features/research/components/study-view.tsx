'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import researchService, { type ResearchStudy } from '@/services/research.service';

/**
 * Read-only view of a study — everything a volunteer would see plus the
 * internal fields, without the risk of an accidental edit.
 *
 * Deliberately in-admin rather than a link to the public site: a draft has no
 * public URL, and a draft is exactly what someone wants to check before
 * publishing it.
 */

const CLASSIFICATION_LABELS: Record<string, string> = {
  research: 'Research',
  service_evaluation: 'Service evaluation',
  audit: 'Audit',
  other: 'Other'
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('en-GB');
}

export default function StudyView({ studyId }: { studyId: string }) {
  const router = useRouter();
  const [study, setStudy] = useState<ResearchStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setStudy(await researchService.getStudy(studyId));
      } catch {
        toast.error('Could not load that study');
        router.push('/dashboard/research');
      } finally {
        setLoading(false);
      }
    })();
  }, [studyId, router]);

  if (loading) return <p className='text-muted-foreground p-6 text-sm'>Loading…</p>;
  if (!study) return null;

  const missing = study.missingGovernanceFields ?? [];
  const approval = formatDate(study.approvalDate);
  const published = formatDate(study.publishedAt);

  return (
    <div className='flex flex-col gap-6 p-4 md:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-bold tracking-tight'>{study.title}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            /{study.slug} · participant info v{study.infoSheetVersion}
            {published ? ` · published ${published}` : ''}
          </p>
          <div className='mt-2 flex flex-wrap gap-2'>
            <Badge variant={study.status === 'published' ? 'default' : 'secondary'}>
              {study.status}
            </Badge>
            <Badge variant='outline'>{study.recruitmentStatus}</Badge>
            <Badge variant='outline'>
              {study.applicationCount} application{study.applicationCount === 1 ? '' : 's'}
              {study.capacity ? ` of ${study.capacity}` : ''}
            </Badge>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={() => router.push('/dashboard/research')}>
            Back
          </Button>
          <Button asChild>
            <Link href={`/dashboard/research/${study.id}`}>Edit</Link>
          </Button>
        </div>
      </div>

      {missing.length > 0 && (
        <div className='rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground'>
          <p className='font-medium'>This study cannot be published yet.</p>
          <p className='mt-1'>Missing: {missing.join(', ')}.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>What volunteers see</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <Row label='Summary' value={study.summary} />
          <Row label='Description' value={study.description} multiline />
          <ListRow label='Eligibility criteria' items={study.inclusionCriteria} />
          <ListRow label='You cannot take part if' items={study.exclusionCriteria} />
          <div className='grid gap-4 sm:grid-cols-2'>
            <Row label='Commitment' value={study.commitment} />
            <Row label='Compensation' value={study.compensation} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Governance</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Row label='Sponsor' value={study.sponsor} />
            <Row
              label='Project classification'
              value={CLASSIFICATION_LABELS[study.classification] ?? study.classification}
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Row label='Protocol reference' value={study.protocolRef} />
            <Row label='Approving body' value={study.approvalBody} />
            <Row label='Approval reference' value={study.approvalReference} />
          </div>
          <Row label='Approval date' value={approval ?? ''} />
          <div className='grid gap-1.5'>
            <p className='text-muted-foreground text-xs font-medium uppercase'>
              Participant information sheet
            </p>
            {study.participantInfoUrl ? (
              <a
                href={study.participantInfoUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm break-all underline'
              >
                {study.participantInfoUrl}
              </a>
            ) : (
              <p className='text-muted-foreground text-sm italic'>Not set</p>
            )}
          </div>
          <Separator />
          <Row label='Risks' value={study.risks} multiline />
          <Row label='Right to withdraw' value={study.withdrawalRights} multiline />
          <Row label='How data is handled' value={study.dataHandling} multiline />
          <Row label='Complaints route' value={study.complaintsRoute} multiline />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  multiline
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  return (
    <div className='grid gap-1.5'>
      <p className='text-muted-foreground text-xs font-medium uppercase'>{label}</p>
      {value?.trim() ? (
        <p className={`text-sm ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value}</p>
      ) : (
        <p className='text-muted-foreground text-sm italic'>Not set</p>
      )}
    </div>
  );
}

function ListRow({ label, items }: { label: string; items?: string[] }) {
  return (
    <div className='grid gap-1.5'>
      <p className='text-muted-foreground text-xs font-medium uppercase'>{label}</p>
      {items && items.length > 0 ? (
        <ul className='list-disc pl-5 text-sm'>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className='text-muted-foreground text-sm italic'>None</p>
      )}
    </div>
  );
}

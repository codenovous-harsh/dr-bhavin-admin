'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import researchService, {
  type Pagination,
  type ResearchStudy,
  type StudyApplication
} from '@/services/research.service';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  published: 'default',
  draft: 'secondary',
  archived: 'outline'
};

const APPLICATION_STATUSES = [
  'new',
  'screening',
  'eligible',
  'ineligible',
  'enrolled',
  'withdrawn'
];

export default function ResearchPage() {
  return (
    <div className='flex flex-col gap-4 p-4 md:p-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Clinical research</h1>
        <p className='text-muted-foreground text-sm'>
          Studies shown on the public site, and the volunteers who have applied.
        </p>
      </div>

      <Tabs defaultValue='studies'>
        <TabsList>
          <TabsTrigger value='studies'>Studies</TabsTrigger>
          <TabsTrigger value='applications'>Applications</TabsTrigger>
        </TabsList>
        <TabsContent value='studies' className='mt-4'>
          <StudiesTab />
        </TabsContent>
        <TabsContent value='applications' className='mt-4'>
          <ApplicationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------- studies ---

function StudiesTab() {
  const [studies, setStudies] = useState<ResearchStudy[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await researchService.listStudies({ page, limit: 10 });
      setStudies(data.studies);
      setPagination(data.pagination);
    } catch {
      toast.error('Could not load studies');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePublish(study: ResearchStudy) {
    const result = await researchService.publishStudy(study.id);
    if (result.ok) {
      toast.success('Study published');
      load();
      return;
    }
    // The backend refuses to publish a study with incomplete governance. Show
    // exactly which fields are outstanding — a generic error would leave the
    // editor guessing.
    toast.error(result.message, {
      description: `Still needed: ${result.missing.join(', ')}`,
      duration: 10000
    });
  }

  async function handleUnpublish(study: ResearchStudy) {
    await researchService.unpublishStudy(study.id);
    toast.success('Study unpublished');
    load();
  }

  async function handleArchive(study: ResearchStudy) {
    await researchService.archiveStudy(study.id);
    toast.success('Study archived');
    load();
  }

  if (loading) return <p className='text-muted-foreground text-sm'>Loading studies…</p>;

  if (studies.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center gap-3 py-10 text-center'>
          <p className='font-medium'>No studies yet</p>
          <p className='text-muted-foreground max-w-md text-sm'>
            The public research page shows a &ldquo;not currently recruiting&rdquo; message until a
            study is published here.
          </p>
          <Button asChild>
            <Link href='/dashboard/research/new'>Create the first study</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Button asChild>
          <Link href='/dashboard/research/new'>New study</Link>
        </Button>
      </div>

      {studies.map((study) => (
        <Card key={study.id}>
          <CardHeader className='flex flex-row items-start justify-between gap-4 space-y-0'>
            <div className='min-w-0'>
              <CardTitle className='text-base'>{study.title}</CardTitle>
              <p className='text-muted-foreground mt-1 text-xs'>
                /{study.slug} · {study.applicationCount} application
                {study.applicationCount === 1 ? '' : 's'}
                {study.capacity ? ` of ${study.capacity}` : ''}
              </p>
            </div>
            <div className='flex flex-shrink-0 gap-2'>
              <Badge variant={STATUS_VARIANT[study.status] ?? 'secondary'}>{study.status}</Badge>
              <Badge variant='outline'>{study.recruitmentStatus}</Badge>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {study.summary?.trim() && (
              <p className='text-muted-foreground line-clamp-2 text-sm'>{study.summary}</p>
            )}

            {/* At-a-glance detail, so the list answers "what is this study?"
                without opening it. Each item is omitted when unset rather than
                shown as an empty label. */}
            {(study.commitment || study.compensation || study.sponsor || study.approvalReference) && (
              <dl className='text-muted-foreground grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2'>
                {study.commitment && <Detail label='Commitment' value={study.commitment} />}
                {study.compensation && <Detail label='Compensation' value={study.compensation} />}
                {study.sponsor && <Detail label='Sponsor' value={study.sponsor} />}
                {study.approvalReference && (
                  <Detail
                    label='Approval'
                    value={
                      study.approvalBody
                        ? `${study.approvalBody} · ${study.approvalReference}`
                        : study.approvalReference
                    }
                  />
                )}
              </dl>
            )}

            {study.missingGovernanceFields.length > 0 && (
              <div className='rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground'>
                <span className='font-medium'>Cannot be published yet.</span> Missing:{' '}
                {study.missingGovernanceFields.join(', ')}
              </div>
            )}
            <div className='flex flex-wrap gap-2'>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/dashboard/research/${study.id}/view`}>View</Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/dashboard/research/${study.id}`}>Edit</Link>
              </Button>
              {study.status === 'published' ? (
                <Button variant='outline' size='sm' onClick={() => handleUnpublish(study)}>
                  Unpublish
                </Button>
              ) : (
                <Button
                  size='sm'
                  onClick={() => handlePublish(study)}
                  disabled={study.missingGovernanceFields.length > 0}
                >
                  Publish
                </Button>
              )}
              {study.status !== 'archived' && (
                <Button variant='ghost' size='sm' onClick={() => handleArchive(study)}>
                  Archive
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {pagination && pagination.pages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-muted-foreground text-sm'>
            Page {pagination.page} of {pagination.pages} · {pagination.total} studies
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex gap-1.5'>
      <dt className='flex-shrink-0 font-medium'>{label}:</dt>
      <dd className='min-w-0 truncate'>{value}</dd>
    </div>
  );
}

// ----------------------------------------------------------- applications ---

function ApplicationsTab() {
  const [applications, setApplications] = useState<StudyApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await researchService.listApplications({
        page,
        limit: 10,
        status: status === 'all' ? undefined : status
      });
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch {
      toast.error('Could not load applications');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: string, next: string) {
    await researchService.updateApplication(id, { status: next });
    toast.success('Application updated');
    load();
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <Select
          value={status}
          onValueChange={(v) => {
            setPage(1);
            setStatus(v);
          }}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className='text-muted-foreground text-sm'>Loading applications…</p>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className='py-10 text-center'>
            <p className='font-medium'>No applications</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Volunteer applications from the public research page appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        applications.map((app) => (
          <Card key={app._id}>
            <CardHeader className='flex flex-row items-start justify-between gap-4 space-y-0'>
              <div className='min-w-0'>
                <CardTitle className='text-base'>
                  {app.firstName} {app.lastName}
                </CardTitle>
                <p className='text-muted-foreground mt-1 text-xs break-all'>
                  {app.email}
                  {app.phone ? ` · ${app.phone}` : ''}
                  {app.dateOfBirth ? ` · DOB ${app.dateOfBirth}` : ''}
                </p>
              </div>
              <Badge variant={app.status === 'new' ? 'default' : 'secondary'}>{app.status}</Badge>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <div className='text-sm'>
                <span className='text-muted-foreground'>Applied to: </span>
                {app.studies.length > 0
                  ? app.studies.map((s) => s.title).join(', ')
                  : 'Registered interest (no specific study)'}
              </div>
              {(app.smoker || app.recentInjectables) && (
                <div className='text-muted-foreground text-sm'>
                  {app.smoker && <>Smoker: {app.smoker}. </>}
                  {app.recentInjectables && <>Recent injectables: {app.recentInjectables}.</>}
                </div>
              )}
              {app.message && <p className='text-sm italic'>&ldquo;{app.message}&rdquo;</p>}
              <div className='flex items-center gap-2'>
                <Select value={app.status} onValueChange={(v) => changeStatus(app._id, v)}>
                  <SelectTrigger className='w-44'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className='text-muted-foreground text-xs'>
                  Received {new Date(app.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {pagination && pagination.pages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-muted-foreground text-sm'>
            Page {pagination.page} of {pagination.pages} · {pagination.total} applications
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

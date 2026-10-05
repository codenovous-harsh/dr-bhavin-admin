'use client';

import { useState } from 'react';
import {
  IconChevronDown,
  IconDownload,
  IconLoader2
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { ReportPdfKind, ReportPdfPatient } from '../pdf/report-document';
import type { SkinAnalysisResult } from '@/types/skinAnalysis';

interface Props {
  analysis: SkinAnalysisResult;
  patient: ReportPdfPatient;
}

/** "Download PDF" — combined, Tier 1 only or Tier 2 only. */
export default function DownloadReportMenu({ analysis, patient }: Props) {
  const [busy, setBusy] = useState<ReportPdfKind | null>(null);

  const tier1 = analysis.tier1?.trim() || '';
  const tier2 = analysis.tier2?.trim() || '';
  const full = analysis.fullAnalysis?.trim() || '';
  if (!tier1 && !tier2 && !full) return null;

  async function download(kind: ReportPdfKind) {
    setBusy(kind);
    try {
      const { downloadReportPdf } = await import('../pdf/download-report-pdf');
      await downloadReportPdf({
        kind,
        patient,
        tier1,
        tier2,
        fullAnalysis: full
      });
    } catch (e) {
      console.error('PDF generation failed', e);
      toast.error('Could not create the PDF. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  // Records from before the tier split only have the one combined text.
  if (!tier1 && !tier2) {
    return (
      <Button
        variant='outline'
        disabled={busy !== null}
        onClick={() => download('full')}
      >
        {busy ? (
          <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <IconDownload className='mr-2 h-4 w-4' />
        )}
        Download PDF
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' disabled={busy !== null}>
          {busy ? (
            <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <IconDownload className='mr-2 h-4 w-4' />
          )}
          {busy ? 'Preparing PDF…' : 'Download PDF'}
          <IconChevronDown className='ml-2 h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuItem
          disabled={!tier1 || !tier2}
          onSelect={() => download('combined')}
        >
          <div>
            <p className='font-medium'>Combined report</p>
            <p className='text-muted-foreground text-xs'>
              Tier 1 and Tier 2 in one PDF
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!tier1} onSelect={() => download('tier1')}>
          <div>
            <p className='font-medium'>Tier 1 only</p>
            <p className='text-muted-foreground text-xs'>Patient summary</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!tier2} onSelect={() => download('tier2')}>
          <div>
            <p className='font-medium'>Tier 2 only</p>
            <p className='text-muted-foreground text-xs'>Clinical report</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

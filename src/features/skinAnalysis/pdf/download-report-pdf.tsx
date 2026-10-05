import type { ReportPdfInput } from './report-document';

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const SUFFIX: Record<ReportPdfInput['kind'], string> = {
  combined: 'full-report',
  tier1: 'tier-1-patient-summary',
  tier2: 'tier-2-clinical-report',
  full: 'report'
};

/**
 * Build the PDF in the browser and save it.
 *
 * react-pdf is around a megabyte, so it is imported here — on click — rather
 * than at the top of the patient page, which would ship it to every admin page
 * load for a button that is pressed occasionally.
 */
export async function downloadReportPdf(input: ReportPdfInput) {
  const [{ pdf }, { ReportDocument, registerPdfFonts }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./report-document')
  ]);
  const origin = window.location.origin;
  registerPdfFonts(origin);

  const blob = await pdf(
    <ReportDocument input={input} origin={origin} />
  ).toBlob();

  const { firstName, lastName, submittedAt } = input.patient;
  const date = submittedAt
    ? new Date(submittedAt).toISOString().slice(0, 10)
    : '';
  const name =
    slug([firstName, lastName].filter(Boolean).join(' ')) || 'patient';
  const filename =
    [name, date, SUFFIX[input.kind]].filter(Boolean).join('-') + '.pdf';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoked on a delay: Safari can still be reading the blob when click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

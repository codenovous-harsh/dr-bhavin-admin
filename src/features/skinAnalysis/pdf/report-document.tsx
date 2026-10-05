import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer';
import { BRAND, MarkdownPdf } from './markdown-pdf';

export type ReportPdfKind = 'combined' | 'tier1' | 'tier2' | 'full';

export interface ReportPdfPatient {
  firstName: string;
  lastName?: string;
  age?: string | number;
  gender?: string;
  ethnicity?: string;
  submittedAt?: string;
  analysedAt?: string;
  analysisId: string;
}

export interface ReportPdfInput {
  kind: ReportPdfKind;
  patient: ReportPdfPatient;
  tier1?: string;
  tier2?: string;
  fullAnalysis?: string;
}

let fontsRegistered = false;

/**
 * Inter — the admin's own typeface — embedded from /public/fonts/pdf. The
 * built-in PDF fonts cannot draw characters the reports use (→ in particular),
 * which would come out as blank gaps in a clinical document.
 */
export function registerPdfFonts(origin: string) {
  if (fontsRegistered) return;
  Font.register({
    family: 'Inter',
    fonts: [
      { src: `${origin}/fonts/pdf/Inter_400Regular.ttf`, fontWeight: 400 },
      {
        src: `${origin}/fonts/pdf/Inter_400Regular_Italic.ttf`,
        fontWeight: 400,
        fontStyle: 'italic'
      },
      { src: `${origin}/fonts/pdf/Inter_600SemiBold.ttf`, fontWeight: 600 },
      { src: `${origin}/fonts/pdf/Inter_700Bold.ttf`, fontWeight: 700 }
    ]
  });
  // react-pdf hyphenates by default, splitting drug and product names mid-word.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1f2933',
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 48
  },
  letterhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 12,
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: BRAND
  },
  // Line height is set on the text styles in markdown-pdf.tsx, not here: on
  // the Page, react-pdf silently drops the absolutely positioned footer, and
  // inherited through a View it is applied twice.
  logo: { width: 130, height: 52, objectFit: 'contain' },
  docTitle: { fontSize: 15, fontWeight: 700, color: BRAND, textAlign: 'right' },
  docSubtitle: {
    fontSize: 8.5,
    color: '#5f6b76',
    textAlign: 'right',
    marginTop: 2
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#eef6f4',
    borderRadius: 3,
    padding: 10,
    marginBottom: 16
  },
  detail: { width: '33.33%', marginBottom: 4 },
  detailLabel: {
    fontSize: 7,
    color: '#5f6b76',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  detailValue: { fontSize: 9.5, fontWeight: 600 },
  sectionBand: {
    backgroundColor: BRAND,
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    marginBottom: 4
  },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#ffffff' },
  sectionNote: { fontSize: 8, color: '#5f6b76', marginBottom: 8, marginTop: 3 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#8a959e',
    borderTopWidth: 1,
    borderTopColor: '#d9e2e0',
    paddingTop: 6
  }
});

const TITLES: Record<ReportPdfKind, string> = {
  combined: 'Skin Analysis Report',
  tier1: 'Patient Summary',
  tier2: 'Clinical Report',
  full: 'Skin Analysis Report'
};

const SUBTITLES: Record<ReportPdfKind, string> = {
  combined: 'Tier 1 patient summary and Tier 2 clinical report',
  tier1: 'Tier 1 — what the patient receives',
  tier2: 'Tier 2 — for the clinical file',
  full: 'Full AI analysis'
};

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
}

function titleCase(value?: string | number) {
  if (value === undefined || value === null || value === '') return '—';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Section({
  title,
  note,
  markdown,
  id
}: {
  title: string;
  note: string;
  markdown: string;
  id: string;
}) {
  return (
    <View>
      <View style={s.sectionBand} minPresenceAhead={80}>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <Text style={s.sectionNote}>{note}</Text>
      <MarkdownPdf markdown={markdown} keyPrefix={id} />
    </View>
  );
}

export function ReportDocument({
  input,
  origin
}: {
  input: ReportPdfInput;
  origin: string;
}) {
  const { kind, patient } = input;
  const name = [patient.firstName, patient.lastName].filter(Boolean).join(' ');
  const generated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const tier1 = (
    <Section
      id='t1'
      title='Tier 1 — Patient Summary'
      note='What the patient receives. Plain English.'
      markdown={input.tier1 || ''}
    />
  );
  const tier2 = (
    <Section
      id='t2'
      title='Tier 2 — Clinical Report'
      note="For Dr Garara's clinical file. Full terminology, confidence tags and safety flags. Not for patient distribution."
      markdown={input.tier2 || ''}
    />
  );

  return (
    <Document
      title={`${TITLES[kind]} — ${name}`}
      author='Dr Bhavin Garara'
      subject={SUBTITLES[kind]}
    >
      <Page size='A4' style={s.page}>
        <View style={s.letterhead}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML img */}
          <Image src={`${origin}/assets/Full.png`} style={s.logo} />
          <View>
            <Text style={s.docTitle}>{TITLES[kind]}</Text>
            <Text style={s.docSubtitle}>{SUBTITLES[kind]}</Text>
          </View>
        </View>

        <View style={s.details}>
          {[
            ['Patient', name || '—'],
            ['Age', patient.age ? String(patient.age) : '—'],
            ['Gender', titleCase(patient.gender)],
            ['Ethnicity', titleCase(patient.ethnicity)],
            ['Submitted', formatDate(patient.submittedAt)],
            ['Analysed', formatDate(patient.analysedAt)]
          ].map(([label, value]) => (
            <View key={label} style={s.detail}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View>
          {kind === 'tier1' && tier1}
          {kind === 'tier2' && tier2}
          {kind === 'combined' && (
            <>
              {tier1}
              {/* The clinical report starts on its own page, so the two can be
                separated physically if only the summary is to be handed over. */}
              <View break>{tier2}</View>
            </>
          )}
          {kind === 'full' && (
            <Section
              id='full'
              title='AI Analysis'
              note='Full analysis as generated.'
              markdown={input.fullAnalysis || ''}
            />
          )}
        </View>

        <View style={s.footer} fixed>
          <Text>
            {name} · AI-assisted skin analysis · Ref{' '}
            {patient.analysisId.slice(-8)} · Generated {generated}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

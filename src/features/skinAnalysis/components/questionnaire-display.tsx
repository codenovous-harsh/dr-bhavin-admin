'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SkinAnalysisQuestionnaire } from '@/types/skinAnalysis';

interface QuestionnaireDisplayProps {
  questionnaire: SkinAnalysisQuestionnaire;
}

type Section = {
  step: string;
  title: string;
  key: string;
  data: string[];
  icon: string;
};

// Normalise scalar/array/null/undefined into a string[] so the renderer is
// uniform. An empty array means the question went unanswered.
function toItems(value: string | string[] | null | undefined): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  const trimmed = String(value).trim();
  return trimmed ? [trimmed] : [];
}

export default function QuestionnaireDisplay({
  questionnaire,
}: QuestionnaireDisplayProps) {
  const q = questionnaire || ({} as SkinAnalysisQuestionnaire);

  const sections: Section[] = [
    // -------- Step 1 — About You --------
    { step: 'Step 1 — About You', title: 'Pregnancy / Breastfeeding', key: 'pregnancyStatus', data: toItems(q.pregnancyStatus), icon: '🤰' },
    { step: 'Step 1 — About You', title: 'Sun Response (Fitzpatrick)', key: 'sunResponse', data: toItems(q.sunResponse), icon: '☀️' },
    { step: 'Step 1 — About You', title: 'Current Medications', key: 'currentMedications', data: toItems(q.currentMedications), icon: '💊' },
    { step: 'Step 1 — About You', title: 'Other Medications (free text)', key: 'currentMedicationsOther', data: toItems(q.currentMedicationsOther), icon: '📝' },
    { step: 'Step 1 — About You', title: 'Recent Hormonal Changes', key: 'recentHormonalChanges', data: toItems(q.recentHormonalChanges), icon: '⚖️' },
    { step: 'Step 1 — About You', title: 'Allergies / Sensitivities', key: 'allergiesSensitivities', data: toItems(q.allergiesSensitivities), icon: '⚠️' },
    { step: 'Step 1 — About You', title: 'Specific Allergy Ingredients', key: 'allergyIngredients', data: toItems(q.allergyIngredients), icon: '🧪' },
    { step: 'Step 1 — About You', title: 'Scarring History', key: 'scarringHistory', data: toItems(q.scarringHistory), icon: '🩹' },
    { step: 'Step 1 — About You', title: 'Family History of Skin Conditions', key: 'familyHistorySkinConditions', data: toItems(q.familyHistorySkinConditions), icon: '👪' },

    // -------- Step 2 — Your Skin --------
    { step: 'Step 2 — Your Skin', title: 'How Skin Feels Day-to-Day', key: 'skinFeel', data: toItems(q.skinFeel), icon: '🤲' },
    { step: 'Step 2 — Your Skin', title: 'Moisturiser Frequency', key: 'moisturiseFrequency', data: toItems(q.moisturiseFrequency), icon: '💧' },
    { step: 'Step 2 — Your Skin', title: 'Skin Inflammation / Sensitivity', key: 'skinInflammation', data: toItems(q.skinInflammation), icon: '🔥' },

    // -------- Step 3 — Your Concerns --------
    { step: 'Step 3 — Your Concerns', title: 'Pigmentation Concerns', key: 'pigmentationConcerns', data: toItems(q.pigmentationConcerns), icon: '🎨' },
    { step: 'Step 3 — Your Concerns', title: 'Eye Area Concerns', key: 'eyeConcerns', data: toItems(q.eyeConcerns), icon: '👁️' },
    { step: 'Step 3 — Your Concerns', title: 'What the Patient Wants to Address', key: 'whatToAddress', data: toItems(q.whatToAddress), icon: '🎯' },
    { step: 'Step 3 — Your Concerns', title: 'Impact Level on Daily Life', key: 'impactLevel', data: toItems(q.impactLevel), icon: '📊' },
    { step: 'Step 3 — Your Concerns', title: 'Goal Timeline', key: 'goalTimeline', data: toItems(q.goalTimeline), icon: '⏳' },

    // -------- Step 4 — Your Habits --------
    { step: 'Step 4 — Your Habits', title: 'Current Skincare Routine', key: 'currentSkincareRoutine', data: toItems(q.currentSkincareRoutine), icon: '🧴' },
    { step: 'Step 4 — Your Habits', title: 'Previous Aesthetic Treatments', key: 'previousTreatments', data: toItems(q.previousTreatments), icon: '💉' },
    { step: 'Step 4 — Your Habits', title: 'Timing of Last Treatment', key: 'lastTreatmentTiming', data: toItems(q.lastTreatmentTiming), icon: '🗓️' },
    { step: 'Step 4 — Your Habits', title: 'Satisfaction with Previous Treatments', key: 'treatmentSatisfaction', data: toItems(q.treatmentSatisfaction), icon: '⭐' },
    { step: 'Step 4 — Your Habits', title: 'Lifestyle Habits', key: 'lifestyleHabits', data: toItems(q.lifestyleHabits), icon: '🏃' },
    { step: 'Step 4 — Your Habits', title: 'Heat / Flushing Triggers', key: 'heatTriggers', data: toItems(q.heatTriggers), icon: '🌡️' },
    { step: 'Step 4 — Your Habits', title: 'Sun Habits', key: 'sunHabits', data: toItems(q.sunHabits ?? q.suncareHabits), icon: '🕶️' },

    // -------- Step 5 — Anything Else --------
    { step: 'Step 5 — Anything Else', title: 'Anything Else to Share', key: 'anythingElse', data: toItems(q.anythingElse ?? q.otherConcernsText), icon: '💬' },
    { step: 'Step 5 — Anything Else', title: 'What Patient Hopes to Get', key: 'whatNext', data: toItems(q.whatNext), icon: '🧭' },
  ];

  // -------- Legacy (only shown when the record has legacy values) --------
  const legacySections: Section[] = [
    { step: 'Legacy', title: 'Skin Moisture Patterns', key: 'skinMoisture', data: toItems(q.skinMoisture), icon: '💧' },
    { step: 'Legacy', title: 'Skin Sebum / Oiliness', key: 'skinSebum', data: toItems(q.skinSebum), icon: '✨' },
    { step: 'Legacy', title: 'Pigmentation (single-select)', key: 'pigmentation', data: toItems(q.pigmentation), icon: '🎨' },
    { step: 'Legacy', title: 'Skin Elasticity', key: 'skinElasticity', data: toItems(q.skinElasticity), icon: '🤸' },
    { step: 'Legacy', title: 'Primary Skin Concerns', key: 'skinConcerns', data: toItems(q.skinConcerns), icon: '📋' },
    { step: 'Legacy', title: 'Other Concerns', key: 'otherConcerns', data: toItems(q.otherConcerns), icon: '📋' },
    { step: 'Legacy', title: 'Address Concerns', key: 'addressConcerns', data: toItems(q.addressConcerns), icon: '🎯' },
  ].filter((s) => s.data.length > 0);

  // Group sections by step for visual separation.
  const allSections = [...sections, ...legacySections];
  const grouped = allSections.reduce<Record<string, Section[]>>((acc, s) => {
    (acc[s.step] ||= []).push(s);
    return acc;
  }, {});
  const stepOrder = [
    'Step 1 — About You',
    'Step 2 — Your Skin',
    'Step 3 — Your Concerns',
    'Step 4 — Your Habits',
    'Step 5 — Anything Else',
    'Legacy',
  ].filter((step) => grouped[step] && grouped[step].length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questionnaire Responses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stepOrder.map((step) => (
          <section key={step}>
            <h3 className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
              {step}
            </h3>
            {/* Question left, answer right, every answer on screen at once.
                This was an accordion: each row cost a click to read, and a
                questionnaire is something you scan across — you are comparing
                what someone said about their medications against what they said
                about their allergies, which is impossible one panel at a time. */}
            <dl className="divide-border divide-y border-t">
              {grouped[step].map((section) => (
                <div
                  key={section.key}
                  className="grid grid-cols-1 gap-x-6 gap-y-0.5 py-2 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
                >
                  <dt className="flex items-start gap-2 text-sm font-medium">
                    <span aria-hidden="true" className="leading-5">
                      {section.icon}
                    </span>
                    <span>{section.title}</span>
                  </dt>
                  <dd className="text-sm">
                    {section.data.length === 0 ? (
                      // Said explicitly rather than left blank: on a medical
                      // record, "not answered" and "answered with nothing" are
                      // different facts and an empty cell conflates them.
                      <span className="text-muted-foreground/70 italic">
                        Not answered
                      </span>
                    ) : section.data.length === 1 ? (
                      <span className="whitespace-pre-wrap">
                        {section.data[0]}
                      </span>
                    ) : (
                      <ul className="space-y-0.5">
                        {section.data.map((item, index) => (
                          <li key={index} className="flex gap-2">
                            <span
                              aria-hidden="true"
                              className="text-muted-foreground"
                            >
                              ·
                            </span>
                            <span className="whitespace-pre-wrap">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

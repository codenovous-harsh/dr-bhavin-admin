// Questionnaire Response Interface — v3.0 (5-step structure) + legacy back-compat
export interface SkinAnalysisQuestionnaire {
  // Step 1 — About You
  pregnancyStatus?: string | null;
  sunResponse?: string | null;
  currentMedications?: string[];
  currentMedicationsOther?: string | null;
  recentHormonalChanges?: string[];
  allergiesSensitivities?: string[];
  allergyIngredients?: string | null;
  scarringHistory?: string[];
  familyHistorySkinConditions?: string[];

  // Step 2 — Your Skin
  skinFeel?: string | null;
  moisturiseFrequency?: string | null;
  skinInflammation?: string[];

  // Step 3 — Your Concerns
  pigmentationConcerns?: string[];
  eyeConcerns?: string[];
  whatToAddress?: string[];
  impactLevel?: string | null;
  goalTimeline?: string | null;

  // Step 4 — Your Habits
  currentSkincareRoutine?: string[];
  previousTreatments?: string[];
  lastTreatmentTiming?: string | null;
  treatmentSatisfaction?: string | null;
  lifestyleHabits?: string[];
  heatTriggers?: string[];
  sunHabits?: string[];

  // Step 5 — Anything Else
  anythingElse?: string | null;
  whatNext?: string | null;

  // Legacy fields (kept for back-compat with records created before v3.0
  // and for the admin's existing manual-entry form)
  skinMoisture?: string[];
  skinSebum?: string[];
  pigmentation?: string;
  skinElasticity?: string[];
  skinConcerns?: string[];
  suncareHabits?: string[];
  otherConcerns?: string[];
  otherConcernsText?: string | null;
  addressConcerns?: string[];
}

// User Information Interface — v3.0 relaxations: lastName/phone optional,
// fullName added, age accepts string (backend changed type), gender enum widened,
// ethnicity is free-form string (enum removed on backend).
export interface SkinAnalysisUserInfo {
  firstName: string;
  lastName?: string;
  fullName?: string;
  email: string;
  age: number | string;
  phone?: string;
  gender: 'male' | 'female' | 'other' | 'prefer not to say' | 'prefer_not_to_say';
  ethnicity: string;
}

// Photo Interface
export interface SkinAnalysisPhoto {
  url: string;
  key: string;
  uploadedAt: string;
}

// AI Analysis Result Interface
export interface SkinAnalysisResult {
  skinType: string;
  primaryConcerns: string[];
  recommendations: string;
  suggestedTreatments: string;
  skincareRoutine: string;
  neckAnalysis?: string;
  fullAnalysis: string;
  // v3.7+ split-tier markdown content. Tier 1 = patient-facing summary; Tier 2 = clinical report.
  // Empty strings for legacy v1 single-tier outputs.
  tier1?: string;
  tier2?: string;
}

// Per-phase timings for the analysis job, recorded by the backend on both the
// completed and failed paths. Every field is optional: records created before
// the field existed have none, and a job whose process died mid-run never got
// to write its own figures.
//
// Note these measure the JOB, not the patient's wait — the R2 photo upload
// happens before the job starts, so `createdAt` → `processedAt` will read
// longer than `totalMs`.
export interface SkinAnalysisTimings {
  startedAt?: string | null;
  /** Fetching photos back from R2 and base64-encoding them. */
  photoLoadMs?: number | null;
  /** The Claude call, request through to final streamed message. */
  aiMs?: number | null;
  /** Time to first streamed token — thinking time vs writing time. */
  firstTokenMs?: number | null;
  /** Whole job, start to terminal state. */
  totalMs?: number | null;
  photoCount?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  /** Near zero means the large system prompt missed the cache. */
  cacheReadTokens?: number | null;
  model?: string;
  promptVersion?: string;
}

// Main Skin Analysis Interface
export interface SkinAnalysis {
  _id: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  email: string;
  age: number | string;
  phone?: string;
  gender: string;
  ethnicity: string;
  consentGiven?: boolean;
  researchConsent?: boolean;
  questionnaire: SkinAnalysisQuestionnaire;
  photos: SkinAnalysisPhoto[];
  analysis: SkinAnalysisResult;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  processedAt?: string;
  timings?: SkinAnalysisTimings;
  createdAt: string;
  updatedAt: string;
  // Virtual derived from firstName + lastName when fullName field is empty.
  displayName?: string;
}

// Analysis Response Interface
export interface SkinAnalysisResponse {
  status: string;
  message: string;
  data: {
    id: string;
    analysis: SkinAnalysisResult;
    createdAt: string;
  };
}

// Full Analysis Response Interface (for retrieval)
export interface SkinAnalysisFullResponse {
  status: string;
  message: string;
  data: SkinAnalysis;
}

// Analysis List Response Interface
export interface SkinAnalysisListResponse {
  status: string;
  message: string;
  data: {
    analyses: SkinAnalysis[];
    pagination: {
      // Normalised envelope shared by every list endpoint.
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      // Legacy keys, still returned for older callers.
      currentPage: number;
      totalAnalyses: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Analysis Stats Interface
export interface SkinAnalysisStats {
  totalAnalyses: number;
  completedAnalyses: number;
  failedAnalyses: number;
  pendingAnalyses: number;
}

// Analysis Stats Response Interface
export interface SkinAnalysisStatsResponse {
  status: string;
  message: string;
  data: SkinAnalysisStats;
}

// Form Data for Creating Analysis
// NOTE: The current admin manual-entry form still collects legacy questionnaire
// fields. Backend now expects v3.0; the form should be rebuilt as a 5-step v3.0
// form. Until then, this type stays permissive.
export interface SkinAnalysisFormData {
  // User Info
  firstName: string;
  lastName?: string;
  fullName?: string;
  email: string;
  age: number | string;
  phone?: string;
  gender: 'male' | 'female' | 'other' | 'prefer not to say' | 'prefer_not_to_say';
  ethnicity: string;

  // Questionnaire
  questionnaire: SkinAnalysisQuestionnaire;

  // Photos
  photos: File[];
}

// Query Options Interface
export interface SkinAnalysisQueryOptions {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

// Questionnaire Options (for form rendering)
export const SKIN_MOISTURE_OPTIONS = [
  'I can use any cleanser to wash my face without feeling dry',
  "I don't apply any products on my face after cleansing",
  'I occasionally apply a moisturiser',
  'I use a moisturiser once a day',
  'I use a moisturiser twice a day',
];

export const SKIN_SEBUM_OPTIONS = [
  'My face is rough or dry',
  'My face is oily in some areas',
  'My face is very oily',
  "My face is uncomfortable if I don't moisturise",
  'I like the feel of oily and/or heavy creams on my skin',
  'None of the Above',
];

export const SKIN_INFLAMMATION_OPTIONS = [
  'Acne (pimples)',
  'Facial Redness or flushing (Rosacea)',
  'Stinging or Burning',
  'A rash with itching, scaling and redness',
  'Irritation from shaving',
  'None of the above',
];

export const PIGMENTATION_OPTIONS = [
  'My skin pigment is uneven AND I want to lighten darker spots',
  'My skin pigment is even AND I have no dark spots',
  'I have freckles or Dark Spots AND I do not want to remove them',
];

export const LIFESTYLE_HABITS_OPTIONS = [
  'I regularly smoke or vape',
  'I often sleep less than 7 hours',
  'I have a stressful lifestyle',
  'I am exposed to pollution or bad air quality regularly',
  'I eat sugary foods over 3 times a week',
  'I exercise less than 3 hours a week',
  'I do not eat a healthy diet',
  'None of the above',
];

export const SUNCARE_HABITS_OPTIONS = [
  'I have used tanning beds',
  'I am exposed to the sun over 3 hours a week',
  'I spend over 3 hours a week close to a window during daylight hours (including driving)',
  'My face has been sunburned and peeled more than twice in my life',
  'I do not take daily antioxidant supplements like vitamin E and C',
  'One of my parents has more wrinkles than others their age',
  'I do not wear sunscreen everyday',
  'I do not wear sunscreen during outdoor activities',
  'None of the Above',
];

export const EYE_CONCERNS_OPTIONS = [
  'Dark Circles',
  'Dryness',
  'Fine lines and Wrinkles',
  'Itching or Redness',
  'Puffiness or Bags',
  'None of the above',
];

export const OTHER_CONCERNS_OPTIONS = [
  'Hair shedding or Thinning',
  'Acne',
  'Rosacea',
  'Skin Tags',
  'Lumps and Bumps',
  'None of the above',
];

export const ADDRESS_CONCERNS_OPTIONS = [
  'Acne Scars',
  'Deep lines and wrinkles',
  'Broken blood vessels on the face',
  'Cellulite',
  'Jaw and Chin Definition',
  'Excess chin fat',
  'Hands - brown spots and sun damage',
  'Hands - Thin and Boney',
  'Loss of Fullness in face',
  'Loss of fullness in the temples (upper face)',
  'Sagging Skin',
  'Stretch marks',
  'Thin lips',
  'Wrinkles - Frown lines',
  'Wrinkles - around mouth',
  'Wrinkles - around eyes',
  'Wrinkles - forehead',
  'Smile lines and Cheek wrinkles',
  'None of the above',
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const ETHNICITY_OPTIONS = [
  { value: 'caucasian', label: 'Caucasian or White' },
  { value: 'black', label: 'Black or Afro Caribbean' },
  { value: 'asian_east', label: 'Asian - East (China, Japan, Korea)' },
  { value: 'asian_south', label: 'Asian - South (India, Sri Lanka, Bangladesh)' },
  { value: 'mediterranean', label: 'Mediterranean (Croatia, Spain, France, Italy, Greece)' },
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'multiracial', label: 'Multiracial' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to say' },
];

// =============================================================================
// v3.0 Questionnaire Options
// =============================================================================
// PROVISIONAL — these labels are placeholders matching the v3.0 questionnaire
// structure but have NOT been reconciled against the live patient-facing form.
// Before rebuilding the admin manual-entry form, copy the actual option labels
// from the patient form so the values stored line up with what real patients
// submit. The admin questionnaire-display component renders whatever string
// values arrive from the API, so display works regardless.

export const PREGNANCY_STATUS_OPTIONS = [
  'Not pregnant or breastfeeding',
  'Pregnant',
  'Breastfeeding',
  'Trying to conceive',
  'Prefer not to say',
];

export const SUN_RESPONSE_OPTIONS = [
  'Always burns, never tans',
  'Usually burns, tans minimally',
  'Sometimes burns, tans gradually',
  'Rarely burns, tans easily',
  'Very rarely burns, tans deeply',
  'Never burns, deeply pigmented',
];

export const CURRENT_MEDICATIONS_OPTIONS = [
  'None',
  'Oral contraceptive pill',
  'HRT',
  'Isotretinoin (Roaccutane / Accutane)',
  'Topical retinoids',
  'Topical steroids',
  'Antibiotics for acne',
  'Blood thinners',
  'Immunosuppressants',
  'Other',
];

export const RECENT_HORMONAL_CHANGES_OPTIONS = [
  'None',
  'Pregnancy or post-partum',
  'Started or stopped oral contraceptive',
  'Started or stopped HRT',
  'Perimenopause / menopause',
  'Recent significant weight change',
];

export const ALLERGIES_SENSITIVITIES_OPTIONS = [
  'None',
  'Fragrance',
  'Essential oils',
  'Sulfates',
  'Lanolin',
  'Specific actives (e.g. retinol, acids)',
  'Other (specify)',
];

export const SCARRING_HISTORY_OPTIONS = [
  'No history of abnormal scarring',
  'Keloid scarring (personal)',
  'Keloid scarring (family)',
  'Vitiligo (personal)',
  'Vitiligo (family)',
  'Hyperpigmentation after injury',
  'Hypopigmentation after injury',
];

export const FAMILY_HISTORY_SKIN_CONDITIONS_OPTIONS = [
  'None known',
  'Melasma',
  'Eczema',
  'Psoriasis',
  'Rosacea',
  'Skin cancer',
  'Severe acne',
];

export const SKIN_FEEL_OPTIONS = [
  'Tight and dry',
  'Comfortable',
  'Combination — dry cheeks, oily T-zone',
  'Oily all over',
  'Sensitive and easily reactive',
  'Dehydrated despite oiliness',
];

export const MOISTURISE_FREQUENCY_OPTIONS = [
  'I do not moisturise',
  'A few times a week',
  'Once a day',
  'Twice a day',
  'More than twice a day',
];

export const PIGMENTATION_CONCERNS_V3_OPTIONS = [
  'None',
  'Melasma',
  'Post-inflammatory hyperpigmentation',
  'Sun spots / age spots',
  'Freckles',
  'Uneven skin tone',
  'Dark patches (specific area)',
];

export const WHAT_TO_ADDRESS_OPTIONS = [
  'Pigmentation / uneven tone',
  'Fine lines and wrinkles',
  'Loss of firmness / sagging',
  'Acne / breakouts',
  'Acne scars',
  'Rosacea / redness',
  'Texture / pores',
  'Dullness',
  'Eye area (dark circles, lines, puffiness)',
  'Neck lines or laxity',
  'Skin health and prevention',
];

export const IMPACT_LEVEL_OPTIONS = [
  'Minimal — I rarely think about it',
  'Mild — it bothers me occasionally',
  'Moderate — it affects my confidence',
  'Significant — it affects my daily life',
  'Severe — I avoid social situations because of it',
];

export const GOAL_TIMELINE_OPTIONS = [
  'As soon as possible',
  'Within 3 months',
  'Within 6 months',
  'Within a year',
  'No specific timeline — long-term skin health',
];

export const CURRENT_SKINCARE_ROUTINE_OPTIONS = [
  'Cleanser',
  'Toner / essence',
  'Vitamin C serum',
  'Retinoid / retinol',
  'Exfoliating acids (AHA / BHA)',
  'Niacinamide',
  'Moisturiser',
  'SPF daily',
  'Eye cream',
  'I do not have a routine',
];

export const PREVIOUS_TREATMENTS_OPTIONS = [
  'None',
  'Chemical peel',
  'Microneedling',
  'Laser (e.g. resurfacing, hair removal, pigmentation)',
  'IPL',
  'Botox / anti-wrinkle injections',
  'Dermal fillers',
  'Polynucleotides / PRP / regenerative injectables',
  'HIFU / Ultherapy',
  'Radiofrequency',
];

export const LAST_TREATMENT_TIMING_OPTIONS = [
  'Within the last month',
  '1–3 months ago',
  '3–6 months ago',
  '6–12 months ago',
  'Over a year ago',
  'Never',
];

export const TREATMENT_SATISFACTION_OPTIONS = [
  'Very satisfied',
  'Satisfied',
  'Mixed results',
  'Dissatisfied',
  'N/A — no prior treatments',
];

export const HEAT_TRIGGERS_OPTIONS = [
  'None',
  'Hot showers / baths',
  'Saunas / steam rooms',
  'Hot yoga / intense exercise',
  'Cooking over heat',
  'Direct sun exposure',
  'Hot drinks / spicy food',
];

export const SUN_HABITS_V3_OPTIONS = [
  'Wear SPF daily, year-round',
  'Wear SPF on sunny days only',
  'Wear SPF only on holiday',
  'Rarely wear SPF',
  'Seek shade and cover up',
  'Use sun beds / actively tan',
];

export const WHAT_NEXT_OPTIONS = [
  'A clear treatment plan',
  'Product recommendations',
  'A consultation with Dr Garara',
  'Just exploring my options',
];

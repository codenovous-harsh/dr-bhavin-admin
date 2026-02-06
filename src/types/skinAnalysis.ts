// Questionnaire Response Interface
export interface SkinAnalysisQuestionnaire {
  skinMoisture?: string[];
  skinSebum?: string[];
  skinInflammation?: string[];
  pigmentation?: string;
  lifestyleHabits?: string[];
  suncareHabits?: string[];
  eyeConcerns?: string[];
  otherConcerns?: string[];
  addressConcerns?: string[];
}

// User Information Interface
export interface SkinAnalysisUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  ethnicity:
    | 'caucasian'
    | 'black'
    | 'asian_east'
    | 'asian_south'
    | 'mediterranean'
    | 'middle_eastern'
    | 'multiracial'
    | 'other'
    | 'prefer_not_to_say';
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
  fullAnalysis: string;
}

// Main Skin Analysis Interface
export interface SkinAnalysis {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone: string;
  gender: string;
  ethnicity: string;
  questionnaire: SkinAnalysisQuestionnaire;
  photos: SkinAnalysisPhoto[];
  analysis: SkinAnalysisResult;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
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
      currentPage: number;
      totalPages: number;
      totalAnalyses: number;
      limit: number;
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
export interface SkinAnalysisFormData {
  // User Info
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  ethnicity:
    | 'caucasian'
    | 'black'
    | 'asian_east'
    | 'asian_south'
    | 'mediterranean'
    | 'middle_eastern'
    | 'multiracial'
    | 'other'
    | 'prefer_not_to_say';

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

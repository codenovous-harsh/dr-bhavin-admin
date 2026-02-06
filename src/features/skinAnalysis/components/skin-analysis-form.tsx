'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import skinAnalysisService from '@/services/skinAnalysis.service';
import type {
  SkinAnalysisFormData,
  SkinAnalysisQuestionnaire,
} from '@/types/skinAnalysis';
import {
  SKIN_MOISTURE_OPTIONS,
  SKIN_SEBUM_OPTIONS,
  SKIN_INFLAMMATION_OPTIONS,
  PIGMENTATION_OPTIONS,
  LIFESTYLE_HABITS_OPTIONS,
  SUNCARE_HABITS_OPTIONS,
  EYE_CONCERNS_OPTIONS,
  OTHER_CONCERNS_OPTIONS,
  ADDRESS_CONCERNS_OPTIONS,
  GENDER_OPTIONS,
  ETHNICITY_OPTIONS,
} from '@/types/skinAnalysis';

export default function SkinAnalysisForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<SkinAnalysisFormData>({
    firstName: '',
    lastName: '',
    email: '',
    age: 0,
    phone: '',
    gender: 'prefer_not_to_say',
    ethnicity: 'prefer_not_to_say',
    questionnaire: {
      skinMoisture: [],
      skinSebum: [],
      skinInflammation: [],
      pigmentation: '',
      lifestyleHabits: [],
      suncareHabits: [],
      eyeConcerns: [],
      otherConcerns: [],
      addressConcerns: [],
    },
    photos: [],
  });

  const totalSteps = 12;

  const handleCheckboxChange = (
    field: keyof SkinAnalysisQuestionnaire,
    value: string
  ) => {
    const currentValues = (formData.questionnaire[field] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setFormData({
      ...formData,
      questionnaire: {
        ...formData.questionnaire,
        [field]: newValues,
      },
    });
  };

  const handleRadioChange = (
    field: keyof SkinAnalysisQuestionnaire,
    value: string
  ) => {
    setFormData({
      ...formData,
      questionnaire: {
        ...formData.questionnaire,
        [field]: value,
      },
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 10) {
        setError('Maximum 10 photos allowed');
        return;
      }
      setFormData({ ...formData, photos: files });
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await skinAnalysisService.submitAnalysis(formData);
      // Redirect to results page
      router.push(`/skin-analysis/results/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit analysis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Skin Moisture</h2>
            <p className="text-gray-600">
              How often do you use a moisturiser for your skin to feel hydrated?
              (Check as many that apply)
            </p>
            <div className="space-y-2">
              {SKIN_MOISTURE_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.skinMoisture?.includes(option)}
                    onChange={() => handleCheckboxChange('skinMoisture', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Skin Sebum</h2>
            <p className="text-gray-600">
              How Oily is your skin? (Check as many that apply)
            </p>
            <div className="space-y-2">
              {SKIN_SEBUM_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.skinSebum?.includes(option)}
                    onChange={() => handleCheckboxChange('skinSebum', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Skin Inflammation</h2>
            <p className="text-gray-600">(Check as many that apply)</p>
            <div className="space-y-2">
              {SKIN_INFLAMMATION_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.skinInflammation?.includes(
                      option
                    )}
                    onChange={() => handleCheckboxChange('skinInflammation', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Do you want to lighten dark spots on your skin?
            </h2>
            <p className="text-gray-600">(Check one that applies)</p>
            <div className="space-y-2">
              {PIGMENTATION_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="pigmentation"
                    checked={formData.questionnaire.pigmentation === option}
                    onChange={() => handleRadioChange('pigmentation', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Lifestyle Habits</h2>
            <p className="text-gray-600">(Check as many that apply)</p>
            <div className="space-y-2">
              {LIFESTYLE_HABITS_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.lifestyleHabits?.includes(
                      option
                    )}
                    onChange={() => handleCheckboxChange('lifestyleHabits', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Suncare Habits</h2>
            <p className="text-gray-600">(Check as many that apply)</p>
            <div className="space-y-2">
              {SUNCARE_HABITS_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.suncareHabits?.includes(option)}
                    onChange={() => handleCheckboxChange('suncareHabits', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Eyes</h2>
            <p className="text-gray-600">(Check as many that apply)</p>
            <div className="space-y-2">
              {EYE_CONCERNS_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.eyeConcerns?.includes(option)}
                    onChange={() => handleCheckboxChange('eyeConcerns', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Any other Concerns</h2>
            <p className="text-gray-600">(Check as many that apply)</p>
            <div className="space-y-2">
              {OTHER_CONCERNS_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.otherConcerns?.includes(option)}
                    onChange={() => handleCheckboxChange('otherConcerns', option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What would you like to address?</h2>
            <p className="text-gray-600">(Check as many that apply)</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ADDRESS_CONCERNS_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.questionnaire.addressConcerns?.includes(
                      option
                    )}
                    onChange={() =>
                      handleCheckboxChange('addressConcerns', option)
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as any,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ethnic Background
                </label>
                <select
                  value={formData.ethnicity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ethnicity: e.target.value as any,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                >
                  {ETHNICITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Age *</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  required
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Upload Your Photos</h2>
            <p className="text-gray-600">
              Please upload clear photos of your face (up to 10 photos). Include
              different angles for better analysis.
            </p>
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
              {formData.photos.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {formData.photos.length} photo(s) selected
                </p>
              )}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 11) {
      return (
        formData.firstName &&
        formData.lastName &&
        formData.email &&
        formData.age > 0 &&
        formData.phone
      );
    }
    if (currentStep === 12) {
      return formData.photos.length > 0;
    }
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">{renderStep()}</div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Analyzing...' : 'Submit for Analysis'}
          </button>
        )}
      </div>
    </div>
  );
}

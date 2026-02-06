'use client';

import { useEffect, useState } from 'react';
import skinAnalysisService from '@/services/skinAnalysis.service';
import type { SkinAnalysis } from '@/types/skinAnalysis';
import ReactMarkdown from 'react-markdown';

interface AnalysisResultsProps {
  analysisId: string;
}

export default function AnalysisResults({ analysisId }: AnalysisResultsProps) {
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await skinAnalysisService.getAnalysisById(analysisId);
        setAnalysis(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <p className="text-yellow-800">Analysis not found</p>
        </div>
      </div>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold text-lg mb-2">
            Analysis Failed
          </h2>
          <p className="text-red-600 mb-4">
            We encountered an issue processing your analysis. Our team will review
            your submission manually.
          </p>
          <p className="text-sm text-gray-600">
            Reference ID: {analysis._id}
          </p>
        </div>
      </div>
    );
  }

  if (analysis.status !== 'completed') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Your analysis is being processed. This may take a few moments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Skin Analysis Results</h1>
        <p className="text-gray-600">
          Analysis for {analysis.firstName} {analysis.lastName}
        </p>
        <p className="text-sm text-gray-500">
          Completed on {new Date(analysis.processedAt || analysis.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Skin Type</h2>
          <p className="text-lg text-gray-700">{analysis.analysis.skinType}</p>
        </div>

        {analysis.analysis.primaryConcerns &&
          analysis.analysis.primaryConcerns.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Primary Concerns</h2>
              <ul className="list-disc list-inside space-y-2">
                {analysis.analysis.primaryConcerns.map((concern, index) => (
                  <li key={index} className="text-gray-700">
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div className="prose max-w-none">
          <ReactMarkdown>{analysis.analysis.fullAnalysis}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-3">
          Next Steps: Professional Consultation
        </h3>
        <p className="text-blue-800 mb-4">
          This AI analysis provides preliminary insights into your skin health.
          For the most accurate diagnosis and a personalized treatment plan, we
          highly recommend scheduling an in-person consultation with{' '}
          <strong>Dr. Bhavin Garara</strong>.
        </p>
        <p className="text-blue-700 mb-4">
          Dr. Garara specializes in advanced skincare treatments and can provide
          tailored solutions based on your unique skin needs and concerns.
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Schedule Consultation
          </button>
          <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            Contact Us
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Analysis ID: {analysis._id}</p>
        <p>
          You can access this analysis anytime by visiting this page or checking
          your email.
        </p>
      </div>
    </div>
  );
}

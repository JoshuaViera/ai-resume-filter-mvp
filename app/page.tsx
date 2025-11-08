'use client';

import { useState } from 'react';
import ResumeUploadForm from '@/components/ResumeUploadForm';
import ResultsTable from '@/components/ResultsTable';
import { ResumeUploadParams, FilterResumesResponse, FilteredCandidate } from '@/types';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<FilteredCandidate[] | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [processingStats, setProcessingStats] = useState<{
    totalProcessed: number;
    totalFiltered: number;
    processingTime: number;
  } | null>(null);

  const handleSubmit = async (params: ResumeUploadParams) => {
    setIsProcessing(true);
    setError(null);
    setResults(null);
    setProcessingStats(null);

    try {
      const formData = new FormData();
      formData.append('keywords', JSON.stringify(params.keywords));
      formData.append('maxDistanceMiles', params.maxDistanceMiles.toString());
      formData.append('businessAddress', params.businessAddress);
      
      params.files.forEach((file: File) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/filterResumes', {
        method: 'POST',
        body: formData,
      });

      const data: FilterResumesResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to process resumes');
      }

      setResults(data.results);
      setSessionId(data.sessionId);
      setProcessingStats({
        totalProcessed: data.totalProcessed,
        totalFiltered: data.totalFiltered,
        processingTime: data.processingTime,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing resumes');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setResults(null);
    setSessionId('');
    setError(null);
    setProcessingStats(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Resume Filter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Filter and rank candidates based on skills and geographic proximity
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!results && !error && (
            <ResumeUploadForm onSubmit={handleSubmit} isProcessing={isProcessing} />
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-lg text-gray-700 mb-2">Processing resumes...</p>
              <p className="text-sm text-gray-500">
                This may take a few minutes depending on the number of files
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
                <XCircle className="text-red-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Processing Failed
                  </h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {results && processingStats && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-600" size={24} />
                  <h3 className="text-lg font-semibold text-green-900">
                    Processing Complete!
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Resumes Processed:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {processingStats.totalProcessed}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Candidates Matched:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {processingStats.totalFiltered}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {(processingStats.processingTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>

              <ResultsTable candidates={results} sessionId={sessionId} />

              <button
                onClick={resetForm}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start New Search
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
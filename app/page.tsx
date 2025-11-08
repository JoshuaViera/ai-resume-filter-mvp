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
    totalMatched: number;
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
        totalMatched: data.totalMatched,
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
    <main className="min-h-screen bg-fog py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-graphite mb-4">
            AI Resume Filter
          </h1>
          <p className="text-lg text-ink max-w-2xl mx-auto">
            Filter and rank candidates based on skills and geographic proximity
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-silver">
          {!results && !error && (
            <ResumeUploadForm onSubmit={handleSubmit} isProcessing={isProcessing} />
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-sky mb-4" size={48} />
              <p className="text-lg text-graphite mb-2">Processing resumes...</p>
              <p className="text-sm text-ink/70">
                This may take a few minutes depending on the number of files
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="bg-coral/10 border border-coral rounded-lg p-6 flex items-start gap-4">
                <XCircle className="text-coral flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-coral mb-2">
                    Processing Failed
                  </h3>
                  <p className="text-ink">{error}</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="w-full bg-sky text-white py-3 rounded-lg font-medium hover:bg-sky/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {results && processingStats && (
            <div className="space-y-6">
              <div className="bg-mint/10 border border-mint rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-mint rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-graphite">
                      Processing Complete!
                    </h3>
                    <p className="text-sm text-ink/70">
                      Your resumes have been filtered and ranked
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border border-silver shadow-sm">
                    <div className="text-xs text-ink/60 mb-1">Resumes Processed</div>
                    <div className="text-2xl font-bold text-graphite">
                      {processingStats.totalProcessed}
                    </div>
                  </div>
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border border-mint shadow-sm">
                    <div className="text-xs text-ink/60 mb-1">Candidates Matched</div>
                    <div className="text-2xl font-bold text-mint">
                      {processingStats.totalMatched}
                    </div>
                  </div>
                  <div className="bg-white backdrop-blur-sm rounded-lg p-3 border border-silver shadow-sm">
                    <div className="text-xs text-ink/60 mb-1">Processing Time</div>
                    <div className="text-2xl font-bold text-graphite">
                      {(processingStats.processingTime / 1000).toFixed(1)}<span className="text-sm text-ink/50 ml-1">sec</span>
                    </div>
                  </div>
                </div>
              </div>

              <ResultsTable candidates={results} sessionId={sessionId} />

              <button
                onClick={resetForm}
                className="w-full bg-sky text-white py-3 rounded-lg font-medium hover:bg-sky/90 transition-colors"
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
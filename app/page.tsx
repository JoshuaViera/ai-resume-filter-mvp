'use client';

import React, { useState } from 'react';
import { ResumeUploadForm } from '@/components/ResumeUploadForm';
// FIX: Corrected default import
import ResultsTable from '@/components/ResultsTable';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
// FIX: Import REAL types instead of stubs
import { FilteredCandidate, ProcessingStatus, ResumeUploadParams, FilterResumesResponse } from '@/types';


export default function Home() {
  const [results, setResults] = useState<FilteredCandidate[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [processingStats, setProcessingStats] = useState<{ totalProcessed: number; totalFiltered: number; processingTime: number; errors?: ProcessingStatus[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFlow = () => {
    setResults(null);
    setProcessingStats(null);
    setError(null);
    setIsProcessing(false);
    setSessionId(null);
  };

  const handleSubmit = async (params: ResumeUploadParams) => {
    setIsProcessing(true);
    setError(null);
    setResults(null);
    setProcessingStats(null);
    setSessionId(null);

    const formData = new FormData();
    formData.append('keywords', params.keywords.join(','));
    // REMOVED: maxDistanceMiles and businessAddress
    
    params.files.forEach((file) => {
      formData.append('files', file);
    });

    try {
        const response = await fetch('/api/filterResumes', { 
            method: 'POST', 
            body: formData 
        });
        
        // FIX: Use the comprehensive FilterResumesResponse type
        const data: FilterResumesResponse | { success: false, error: string } = await response.json();
      
        if (response.ok && data.success) {
            setResults(data.results);
            setSessionId(data.sessionId); // <-- Store the session ID
            setProcessingStats({
                totalProcessed: data.totalProcessed,
                totalFiltered: data.totalFiltered,
                processingTime: data.processingTime,
                errors: data.errors,
            });
        } else {
            // FIX: This is the exact location of the fix.
            // We check for the 'error' property on the 'data' object
            // to correctly handle the union type and resolve the TS error.
            let errorMessage = `Filtering failed with status ${response.status}.`;
            if (data && 'error' in data) {
                errorMessage = data.error;
            }
            setError(errorMessage);
        }
    } catch (err: any) {
        console.error('Submission Error:', err);
        setError('Failed to communicate with the filtering service. Check network or server logs.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine the current step for the indicator
  const currentStep = isProcessing ? 2 : (results ? 3 : 1);

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="text-center mb-14">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
            AI Candidate Scoring Engine
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Upload resumes, define criteria, and instantly get ranked, geolocated results.
          </p>
        </header>

        {/* --- STEP INDICATOR (Polished UI) --- */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex justify-between items-center relative">
            {[1, 2, 3].map((step) => {
              const isActive = step === currentStep;
              const isComplete = step < currentStep;

              return (
                <div key={step} className="flex-1 flex flex-col items-center z-10">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all duration-500 
                      ${isComplete ? 'bg-indigo-600 text-white border-white shadow-lg' : 
                        isActive ? 'bg-white text-indigo-700 border-indigo-500 shadow-2xl scale-110' : 
                        'bg-gray-200 text-gray-500 border-gray-100 shadow-inner'
                      }`}
                  >
                    {isComplete ? <CheckCircle size={24} /> : step}
                  </div>
                  <p className={`mt-3 text-sm font-semibold transition-colors duration-300 text-center ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>
                    {step === 1 && 'Define Criteria'}
                    {step === 2 && 'Process & Score'}
                    {step === 3 && 'Final Results'}
                  </p>
                </div>
              );
            })}
            {/* Dynamic Connector Line */}
            <div className="absolute top-[26px] left-0 right-0 h-1 bg-gray-300 z-0">
              <div 
                className={`h-full bg-indigo-500 transition-all duration-700 ease-out`}
                style={{ width: `${(currentStep - 1) * 50}%` }}
              ></div>
            </div>
          </div>
        </div>
        {/* --- END STEP INDICATOR --- */}

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-4 mb-8 rounded-xl flex items-center gap-3" role="alert">
              <AlertTriangle size={24} className="flex-shrink-0 text-red-500" />
              <div className="font-medium">
                <p>Processing Failed:</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={resetFlow}
                  className="mt-2 text-sm font-bold text-red-800 hover:underline"
                >
                  Click here to try again
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Form */}
          {currentStep === 1 && !error && (
              <ResumeUploadForm onSubmit={handleSubmit} isProcessing={isProcessing} />
          )}

          {/* Step 2: Processing */}
          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center py-20 bg-indigo-50/50 rounded-2xl border-2 border-indigo-200 backdrop-blur-sm">
              <Loader2 className="animate-spin text-indigo-600 mb-6" size={72} />
              <p className="text-3xl font-bold text-gray-800 mb-2">
                Analyzing Candidates...
              </p>
              <p className="text-lg text-gray-600 max-w-xl text-center">
                We are extracting data, running skill matches, and performing geocoding checks. Please wait a moment.
              </p>
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && results && processingStats && sessionId && (
            <div className="space-y-10">
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <CheckCircle className="text-green-600" size={36} />
                  <h3 className="text-3xl font-bold text-green-900">
                    Analysis Complete!
                  </h3>
                </div>
                <p className="text-lg text-green-800 mb-4 font-semibold">
                    ✅ {processingStats.totalFiltered} candidates matched your criteria and are ranked by **Overall Score**.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm font-medium text-green-900 border-t border-green-200 pt-4">
                    <p>Total Files Processed: <span className="font-extrabold">{processingStats.totalProcessed}</span></p>
                    <p>Time Taken: <span className="font-extrabold">{processingStats.processingTime.toFixed(2)}s</span></p>
                    {processingStats.errors && processingStats.errors.length > 0 && (
                        <p className="text-red-700 font-bold col-span-full sm:col-span-1">
                            {processingStats.errors.length} File(s) Failed
                        </p>
                    )}
                </div>
                {/* Show details of failed files */}
                {processingStats.errors && processingStats.errors.length > 0 && (
                    <div className="mt-4 border-t border-green-200 pt-4">
                        <h4 className="text-sm font-bold text-red-800">File Errors:</h4>
                        <ul className="text-xs text-red-700 list-disc list-inside max-h-20 overflow-y-auto">
                            {processingStats.errors.map(err => (
                                <li key={err.fileName}><strong>{err.fileName}:</strong> {err.error}</li>
                            ))}
                        </ul>
                    </div>
                )}
              </div>
              
              <ResultsTable 
                candidates={results} 
                sessionId={sessionId} 
                onReset={resetFlow} // <-- Wire up the reset button
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
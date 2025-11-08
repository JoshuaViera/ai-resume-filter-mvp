'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { ResumeUploadParams } from '@/types';

interface ResumeUploadFormProps {
  onSubmit: (params: ResumeUploadParams) => Promise<void>;
  isProcessing: boolean;
}

export default function ResumeUploadForm({ onSubmit, isProcessing }: ResumeUploadFormProps) {
  const [keywords, setKeywords] = useState<string>('');
  const [maxDistanceMiles, setMaxDistanceMiles] = useState<number>(25);
  const [businessAddress, setBusinessAddress] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    disabled: isProcessing,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!keywords.trim()) {
      newErrors.keywords = 'Please enter at least one keyword';
    }

    if (!businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
    }

    if (maxDistanceMiles < 1 || maxDistanceMiles > 500) {
      newErrors.maxDistanceMiles = 'Distance must be between 1 and 500 miles';
    }

    if (files.length === 0) {
      newErrors.files = 'Please upload at least one resume';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const keywordsArray = keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    await onSubmit({
      keywords: keywordsArray,
      maxDistanceMiles,
      businessAddress,
      files,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-graphite mb-2">
          Required Skills/Keywords
          <span className="text-coral ml-1">*</span>
        </label>
        <input
          id="keywords"
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., OSHA 30, Saucier, JavaScript, React"
          className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-sky focus:border-sky bg-white text-ink"
          disabled={isProcessing}
        />
        <p className="text-xs text-ink/60 mt-1">Separate multiple keywords with commas</p>
        {errors.keywords && (
          <p className="text-sm text-coral mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.keywords}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-graphite mb-2">
          Business Address
          <span className="text-coral ml-1">*</span>
        </label>
        <input
          id="address"
          type="text"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          placeholder="123 Main St, New York, NY 10001"
          className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-sky focus:border-sky bg-white text-ink"
          disabled={isProcessing}
        />
        {errors.businessAddress && (
          <p className="text-sm text-coral mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.businessAddress}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-graphite mb-2">
          Maximum Commute Distance (miles)
          <span className="text-coral ml-1">*</span>
        </label>
        <input
          id="distance"
          type="number"
          min="1"
          max="500"
          value={maxDistanceMiles}
          onChange={(e) => setMaxDistanceMiles(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-silver rounded-lg focus:ring-2 focus:ring-sky focus:border-sky bg-white text-ink"
          disabled={isProcessing}
        />
        {errors.maxDistanceMiles && (
          <p className="text-sm text-coral mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.maxDistanceMiles}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-graphite mb-2">
          Upload Resumes
          <span className="text-coral ml-1">*</span>
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-sky bg-sky/10'
              : 'border-silver hover:border-sky/50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-sky mb-4" />
          {isDragActive ? (
            <p className="text-sky">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-graphite mb-2">
                Drag & drop resume files here, or click to select
              </p>
              <p className="text-sm text-ink/60">
                Supports PDF, DOC, DOCX, TXT files
              </p>
            </div>
          )}
        </div>
        {errors.files && (
          <p className="text-sm text-coral mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.files}
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-graphite">
            Uploaded Files ({files.length})
          </p>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-fog border border-silver px-4 py-2 rounded-lg"
              >
                <span className="text-sm text-ink truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isProcessing}
                  className="text-coral hover:text-coral/80 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-sky text-white py-3 rounded-lg font-medium hover:bg-sky/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing Resumes...
          </>
        ) : (
          'Filter Resumes'
        )}
      </button>
    </form>
  );
}
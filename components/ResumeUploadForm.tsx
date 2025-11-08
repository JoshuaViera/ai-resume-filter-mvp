'use client';

import { useReducer, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
// FIX: Import REAL type
import { ResumeUploadParams } from '@/types';
import { X, FileText, UploadCloud, MapPin, Search, CheckCircle, Loader2 } from 'lucide-react';

// --- Types and Reducer ---

interface FormState {
  keywords: string;
  // REMOVED: maxDistanceMiles
  // REMOVED: businessAddress
  files: File[];
  errors: Record<string, string>;
  submitted: boolean;
}

type Action = 
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'ADD_FILE'; file: File }
  | { type: 'REMOVE_FILE'; fileName: string }
  | { type: 'SET_ERROR'; errors: Record<string, string> }
  | { type: 'RESET_ERRORS' }
  | { type: 'SET_SUBMITTED'; value: boolean };

const initialState: FormState = {
  keywords: 'React, TypeScript, Node.js', // Pre-filled for demo
  // REMOVED: maxDistanceMiles
  // REMOVED: businessAddress
  files: [],
  errors: {},
  submitted: false,
};

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      // Clear error when user starts typing in a field
      const newErrors = { ...state.errors };
      delete newErrors[action.field as keyof FormState];
      return { ...state, [action.field]: action.value, errors: newErrors };
    case 'ADD_FILE':
      if (state.files.some(f => f.name === action.file.name)) {
        return state;
      }
      // Clear file error when a file is added
      const newFileErrors = { ...state.errors };
      delete newFileErrors.files;
      return { ...state, files: [...state.files, action.file], errors: newFileErrors };
    case 'REMOVE_FILE':
      return { ...state, files: state.files.filter(f => f.name !== action.fileName) };
    case 'SET_ERROR':
      return { ...state, errors: action.errors };
    case 'RESET_ERRORS':
      return { ...state, errors: {} };
    case 'SET_SUBMITTED':
      return { ...state, submitted: action.value };
    default:
      return state;
  }
}

// --- Component Definition ---

interface ResumeUploadFormProps {
  onSubmit: (params: ResumeUploadParams) => void;
  isProcessing: boolean;
}

// FIX: Change named export to default or ensure import matches
export function ResumeUploadForm({ onSubmit, isProcessing }: ResumeUploadFormProps) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Validate fields on submit
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (state.keywords.trim().length === 0) {
      newErrors.keywords = 'Please enter at least one keyword or skill.';
    }
    // REMOVED: Validation for address and distance
    if (state.files.length === 0) {
      newErrors.files = 'Please upload at least one resume file.';
    }

    dispatch({ type: 'SET_ERROR', errors: newErrors });
    return Object.keys(newErrors).length === 0;
  }, [state.keywords, state.files]); // UPDATED dependencies

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_SUBMITTED', value: true });

    if (validate()) {
      // UPDATED: Params object
      const params: ResumeUploadParams = {
        keywords: state.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
        files: state.files,
      };
      onSubmit(params);
    }
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
        dispatch({ type: 'ADD_FILE', file });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    disabled: isProcessing,
  });

  // Highlight required fields after first submission attempt OR if error exists
  const getFieldClass = (fieldName: keyof FormState) => 
    `w-full px-4 py-3 border rounded-lg focus:ring-2 transition duration-150 ${
        (state.submitted && state.errors[fieldName]) || state.errors[fieldName]
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
    } ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;
  
  const filesList = useMemo(() => state.files.map(file => (
    <li key={file.name} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-sm transition hover:bg-gray-50">
      <div className="flex items-center truncate">
        <FileText size={18} className="text-blue-500 mr-2 flex-shrink-0" />
        <span className="truncate font-medium text-gray-700">{file.name}</span>
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'REMOVE_FILE', fileName: file.name })}
        className="text-gray-400 hover:text-red-500 p-1 rounded-full transition"
        disabled={isProcessing}
        aria-label={`Remove ${file.name}`}
      >
        <X size={16} />
      </button>
    </li>
  )), [state.files, isProcessing]);


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* 1. SKILLS & CRITERIA (Keywords) */}
      <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
          <Search size={24} /> 1. Define Required Skills
        </h2>
        <p className="text-sm text-gray-600">
          Enter the **essential skills, keywords, or certifications** that candidates must possess. Our AI will look for matches and score them.
        </p>
        <div>
          <label htmlFor="keywords" className="block text-sm font-bold text-gray-700 mb-2">
            Keywords (Separated by comma)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="keywords"
            type="text"
            value={state.keywords}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'keywords', value: e.target.value })}
            placeholder="e.g., Python, AWS, PMP, Scrum Master"
            className={getFieldClass('keywords')}
            disabled={isProcessing}
          />
          {state.errors.keywords && <p className="mt-1 text-sm text-red-500">{state.errors.keywords}</p>}
        </div>
      </div>

      {/* REMOVED: 2. LOCATION CRITERIA */}
      
      {/* 2. UPLOAD RESUMES (UPDATED) */}
      <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
          <UploadCloud size={24} /> 2. Upload Resumes to Scan
        </h2>
        <p className="text-sm text-gray-600">
            Upload the resume files (PDF, DOCX, TXT) you want the AI to analyze and score. You can upload multiple files at once.
        </p>

        <div 
          {...getRootProps()} 
          className={`
            p-8 border-2 border-dashed rounded-lg text-center transition-colors duration-200 cursor-pointer
            ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            ${(state.submitted && state.errors.files) || state.errors.files ? 'border-red-500 bg-red-50 hover:border-red-600' : ''}
            ${isProcessing ? 'cursor-not-allowed opacity-75' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <UploadCloud size={32} className={`mx-auto mb-2 ${isDragActive ? 'text-blue-600' : 'text-gray-500'}`} />
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? "Drop the files here..." : "Drag 'n' drop resumes here, or click to select files."}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (Accepted formats: PDF, DOC, DOCX, TXT)
          </p>
        </div>
        {state.errors.files && <p className="mt-1 text-sm text-red-500 font-medium">{state.errors.files}</p>}
      
        {/* File Preview List */}
        {state.files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
                {state.files.length} File(s) Ready:
            </h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {filesList}
            </ul>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.01]"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              AI is Analyzing {state.files.length} Resumes...
            </>
          ) : (
            <>
              <CheckCircle size={24} />
              Start Filtering & Scoring
            </>
          )}
        </button>
      </div>
    </form>
  );
}
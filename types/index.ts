// Resume Processing Types
export interface ResumeUploadParams {
  keywords: string[];
  maxDistanceMiles: number;
  businessAddress: string;
  files: File[];
}

export interface ExtractedResumeData {
  fileName: string;
  candidateName: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  experience: string[];
  rawText: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface FilteredCandidate {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  address: string;
  distanceMiles: number;
  commuteEstimate: string;
  matchedSkills: string[];
  skillMatchScore: number;
  overallScore: number;
  resumeUrl: string;
  createdAt: string;
}

export interface ProcessingStatus {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Database Types
export interface EmployerRecord {
  id: string;
  business_name: string;
  contact_email: string;
  address: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface SkillsLexiconRecord {
  id: string;
  skill_name: string;
  category: string;
  synonyms: string[];
  created_at: string;
}

export interface FilteredResultRecord {
  id: string;
  session_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  address: string;
  distance_miles: number;
  matched_skills: string[];
  skill_match_score: number;
  overall_score: number;
  resume_url: string;
  created_at: string;
}

// API Response Types
export interface FilterResumesResponse {
  success: boolean;
  sessionId: string;
  results: FilteredCandidate[];
  totalProcessed: number;
  totalMatched: number;
  totalFiltered: number;
  processingTime: number;
  errors?: ProcessingStatus[];
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}
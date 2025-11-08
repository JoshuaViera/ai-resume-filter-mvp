// --- Form & API Payloads ---

export interface ResumeUploadParams {
  keywords: string[];
  // REMOVED: maxDistanceMiles
  // REMOVED: businessAddress
  files: File[];
}

// --- Data Processing Types ---

export interface ExtractedResumeData {
  fileName: string;
  candidateName: string;
  email: string;
  phone: string;
  // REMOVED: address
  skills: string[];
  experience: string[];
  rawText: string;
}

// REMOVED: GeocodingResult type

/**
 * This is the final, comprehensive candidate object.
 * It's created by the API and saved to the DB.
 */
export interface FilteredCandidate {
  id: string; // From Supabase DB
  candidateName: string;
  email: string;
  phone: string;
  // REMOVED: address
  // REMOVED: distanceMiles
  matchedSkills: string[];
  skillMatchScore: number;
  overallScore: number;
  resumeUrl: string;
  createdAt: string; // From Supabase DB
}

export interface ProcessingStatus {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// --- API Response Types ---

/**
 * This is the successful response from /api/filterResumes
 */
export interface FilterResumesResponse {
  success: true;
  sessionId: string;
  results: FilteredCandidate[];
  totalProcessed: number;
  totalFiltered: number;
  processingTime: number;
  errors?: ProcessingStatus[]; // List of files that failed
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

// --- Database Table Types ---
// (Matches your database.sql schema)

export interface EmployerRecord {
  id: string;
  business_name: string;
  contact_email: string;
  // REMOVED: address, lat, lng
  created_at: string;
}

export interface SkillsLexiconRecord {
  id: string;
  skill_name: string;
  category: string;
  synonyms: string[];
  created_at: string;
}

/**
 * This interface maps to the 'filtered_results' table.
 * Note the snake_case for Supabase columns.
 *
 * IMPORTANT: You will need to update your 'filtered_results' table
 * in Supabase to remove the 'address' and 'distance_miles' columns
 * or make them nullable.
 */
export interface FilteredResultRecord {
  id: string;
  session_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  // REMOVED: address
  // REMOVED: distance_miles
  matched_skills: string[];
  skill_match_score: number;
  overall_score: number;
  resume_url: string;
  created_at: string;
}
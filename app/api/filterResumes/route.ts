import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabaseClient'; // Use admin for service-level actions
import { extractTextFromFile } from '@/lib/fileProcessor';
// REMOVED: Geocoding imports
import { parseResumeWithAI, scoreSkillMatch } from '@/lib/resumeParser';
import { ExtractedResumeData, FilteredCandidate, ProcessingStatus } from '@/types';

// Constants for scoring
// UPDATED: Scoring is now 100% based on skills
const MIN_SKILL_SCORE = 50; // Minim um skill score to even be considered

/**
 * POST handler for /api/filterResumes
 * UPDATED: This route no longer uses geocoding and scores based purely on skills.
 */
export async function POST(request: Request) {
    const startTime = process.hrtime();
    const supabase = supabaseAdmin();
    const sessionId = uuidv4(); // Unique ID for this batch
    
    let totalProcessed = 0;
    let totalFiltered = 0;

    try {
        // 1. Parse Form Data
        const formData = await request.formData();
        const keywordsString = formData.get('keywords') as string;
        // REMOVED: businessAddress and maxDistanceMiles
        const files = formData.getAll('files') as File[];

        const keywords = keywordsString ? keywordsString.split(',').map(k => k.trim()).filter(k => k) : [];

        // UPDATED: Validation
        if (files.length === 0 || keywords.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: files or keywords.' },
                { status: 400 }
            );
        }

        // REMOVED: Geocode Business Address section

        const filteredResults: FilteredCandidate[] = [];
        const processingErrors: ProcessingStatus[] = [];

        // 3. Process Files Iteratively
        const processingPromises = files.map(async (file) => {
            totalProcessed++;
            try {
                // Step 3a: Upload to Storage
                const filePath = `${sessionId}/${file.name}`;
                const { data: storageData, error: storageError } = await supabase.storage
                    .from('resumes')
                    .upload(filePath, file);
                
                if (storageError) throw new Error(`Storage Error: ${storageError.message}`);

                const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
                const resumeUrl = urlData.publicUrl;

                // Step 3b: Extract Text
                const rawText = await extractTextFromFile(file);

                // Step 3c: Parse with AI (UPDATED: no address)
                const parsedData: ExtractedResumeData = await parseResumeWithAI(rawText, file.name);

                // REMOVED: Geocode Candidate Address section
                // REMOVED: FILTER 1 - Location

                // Step 3d: Score Skills with AI
                const { matchedSkills, score: skillMatchScore } = await scoreSkillMatch(parsedData.skills, keywords);

                // Step 3e: FILTER 1 - Skill Score
                if (skillMatchScore < MIN_SKILL_SCORE) {
                    throw new Error(`Filtered out: Skill score of ${skillMatchScore} is below minimum ${MIN_SKILL_SCORE}.`);
                }

                // Step 3f: Calculate Final Score (UPDATED: 100% skill score)
                const overallScore = skillMatchScore;

                // Step 3g: Create Final Candidate Object (UPDATED: no location data)
                const candidate: Omit<FilteredCandidate, 'id' | 'createdAt'> = {
                    candidateName: parsedData.candidateName,
                    email: parsedData.email,
                    phone: parsedData.phone,
                    // REMOVED: address
                    // REMOVED: distanceMiles
                    matchedSkills,
                    skillMatchScore,
                    overallScore,
                    resumeUrl,
                };

                // Step 3h: Save to Database (UPDATED: no location data)
                const { data: dbData, error: dbError } = await supabase
                    .from('filtered_results')
                    .insert({ 
                        ...candidate, 
                        session_id: sessionId,
                        // Set fields to null or default if they still exist in DB
                        // It's better to alter your DB schema to remove these columns
                        address: null, 
                        distance_miles: null 
                    })
                    .select()
                    .single();

                if (dbError) throw new Error(`Database Error: ${dbError.message}`);
                
                filteredResults.push(dbData as FilteredCandidate);
                totalFiltered++;
                processingErrors.push({ fileName: file.name, status: 'completed' });

            } catch (fileError: any) {
                // Catch errors for a single file
                console.error(`Error processing file ${file.name}:`, fileError.message);
                processingErrors.push({ 
                    fileName: file.name, 
                    status: 'failed', 
                    error: fileError.message
                });
            }
        });

        await Promise.all(processingPromises);

        // 4. Finalize and Respond
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const processingTime = seconds + nanoseconds / 1e9;
        
        // Sort by overall score (highest first)
        filteredResults.sort((a, b) => b.overallScore - a.overallScore);
        
        return NextResponse.json({
            success: true,
            sessionId: sessionId,
            results: filteredResults,
            totalProcessed: totalProcessed,
            totalFiltered: totalFiltered,
            processingTime: parseFloat(processingTime.toFixed(2)),
            errors: processingErrors.filter(e => e.status === 'failed'),
        });

    } catch (mainError: any) {
        // 5. CATCH-ALL BLOCK
        console.error('CRITICAL SERVER ERROR in filterResumes:', mainError);
        
        return NextResponse.json(
            { 
                success: false, 
                error: `Internal Server Error: ${mainError.message || 'Unknown processing failure.'}`,
            },
            { status: 500 }
        );
    }
}
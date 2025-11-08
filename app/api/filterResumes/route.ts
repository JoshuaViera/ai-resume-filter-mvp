import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { geocodeAddress, calculateDistance } from '@/lib/geocoding';
import { parseResumeWithAI, scoreSkillMatch } from '@/lib/resumeParser';
import { extractTextFromFile } from '@/lib/fileProcessor';
import { FilterResumesResponse, ProcessingStatus, FilteredCandidate } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const sessionId = uuidv4();

  try {
    const formData = await request.formData();
    
    const keywords = JSON.parse(formData.get('keywords') as string);
    const maxDistanceMiles = parseFloat(formData.get('maxDistanceMiles') as string);
    const businessAddress = formData.get('businessAddress') as string;
    const files = formData.getAll('files') as File[];

    if (!keywords || !maxDistanceMiles || !businessAddress || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Geocoding business address...');
    const businessLocation = await geocodeAddress(businessAddress);
    
    if (!businessLocation) {
      return NextResponse.json(
        { success: false, error: 'Could not geocode business address' },
        { status: 400 }
      );
    }

    const processingStatuses: ProcessingStatus[] = [];
    const filteredCandidates: FilteredCandidate[] = [];
    const supabase = supabaseAdmin();

    for (const file of files) {
      const status: ProcessingStatus = {
        fileName: file.name,
        status: 'processing',
      };
      processingStatuses.push(status);

      try {
        console.log(`Processing ${file.name}...`);
        const resumeText = await extractTextFromFile(file);

        const fileBuffer = await file.arrayBuffer();
        const fileName = `${sessionId}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('resumes')
          .upload(fileName, fileBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase
          .storage
          .from('resumes')
          .getPublicUrl(fileName);

        const resumeUrl = urlData.publicUrl;

        const extractedData = await parseResumeWithAI(resumeText, file.name);

        const candidateLocation = await geocodeAddress(extractedData.address);
        
        if (!candidateLocation) {
          status.status = 'failed';
          status.error = 'Could not geocode candidate address';
          continue;
        }

        const distanceMiles = calculateDistance(
          businessLocation.lat,
          businessLocation.lng,
          candidateLocation.lat,
          candidateLocation.lng
        );

        if (distanceMiles > maxDistanceMiles) {
          status.status = 'completed';
          console.log(`${file.name} filtered out: ${distanceMiles} miles > ${maxDistanceMiles} miles`);
          continue;
        }

        const { matchedSkills, score: skillMatchScore } = await scoreSkillMatch(
          extractedData.skills,
          keywords
        );

        const locationScore = Math.max(0, 100 - (distanceMiles / maxDistanceMiles) * 100);
        const overallScore = Math.round(skillMatchScore * 0.7 + locationScore * 0.3);

        const candidate: FilteredCandidate = {
          id: uuidv4(),
          candidateName: extractedData.candidateName,
          email: extractedData.email,
          phone: extractedData.phone,
          address: candidateLocation.formattedAddress,
          distanceMiles,
          matchedSkills,
          skillMatchScore,
          overallScore,
          resumeUrl,
          createdAt: new Date().toISOString(),
        };

        const { error: dbError } = await supabase
          .from('filtered_results')
          .insert({
            session_id: sessionId,
            candidate_name: candidate.candidateName,
            email: candidate.email,
            phone: candidate.phone,
            address: candidate.address,
            distance_miles: candidate.distanceMiles,
            matched_skills: candidate.matchedSkills,
            skill_match_score: candidate.skillMatchScore,
            overall_score: candidate.overallScore,
            resume_url: candidate.resumeUrl,
          });

        if (dbError) throw dbError;

        filteredCandidates.push(candidate);
        status.status = 'completed';
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        status.status = 'failed';
        status.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    filteredCandidates.sort((a, b) => b.overallScore - a.overallScore);

    const processingTime = Date.now() - startTime;

    const response: FilterResumesResponse = {
      success: true,
      sessionId,
      results: filteredCandidates,
      totalProcessed: files.length,
      totalFiltered: filteredCandidates.length,
      processingTime,
      errors: processingStatuses.filter(s => s.status === 'failed'),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Filter resumes error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process resumes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
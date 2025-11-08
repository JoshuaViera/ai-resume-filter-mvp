import OpenAI from 'openai';
import { ExtractedResumeData } from '@/types';

// IMPORTANT: Ensure this is set in your .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parses resume text using OpenAI GPT-4 to extract structured data.
 */
export async function parseResumeWithAI(
  resumeText: string,
  fileName: string
): Promise<ExtractedResumeData> {
  
  // Truncate text if it's too long to avoid excessive API costs/errors
  const maxTextLength = 15000; // Approx 4k tokens
  const truncatedText = resumeText.length > maxTextLength ? resumeText.substring(0, maxTextLength) : resumeText;

  const prompt = `You are a world-class resume parsing expert. Extract the following information from this resume text. Return ONLY valid JSON.

Resume Text:
"""
${truncatedText}
"""

Extract:
1. candidateName: Full name (e.g., "Jane Doe")
2. email: Email address (e.g., "jane.doe@email.com")
3. phone: Phone number (e.g., "(555) 123-4567")
4. skills: An array of technical and professional skills (e.g., ["Python", "React", "Project Management", "AWS"])
5. experience: An array of strings, each formatted as "Job Title at Company" (e.g., ["Software Engineer at Google", "Web Developer at Microsoft"])

Return ONLY valid JSON in this exact format. If a field is not found, use an empty string "" or an empty array [].
{
  "candidateName": "string",
  "email": "string",
  "phone": "string",
  "skills": ["string"],
  "experience": ["string"]
}`;
// REMOVED: "address" field from prompt

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Use the latest powerful model
      messages: [
        {
          role: 'system',
          content: 'You are a precise resume parser that returns only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temp for deterministic output
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    const parsed = JSON.parse(content);

    // Validate and structure the data
    return {
      fileName,
      candidateName: parsed.candidateName || 'Unknown',
      email: parsed.email || '',
      phone: parsed.phone || '',
      // REMOVED: address
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      rawText: truncatedText, // Return the (potentially truncated) text that was processed
    };
  } catch (error: any) {
    console.error(`AI parsing error for ${fileName}:`, error.message);
    // Return a default object on failure so the process can continue
    return {
        fileName,
        candidateName: 'Parsing Failed',
        email: '',
        phone: '',
        // REMOVED: address
        skills: [],
        experience: [],
        rawText: truncatedText,
    };
  }
}

/**
 * Scores skill match using OpenAI.
 */
export async function scoreSkillMatch(
  candidateSkills: string[],
  requiredKeywords: string[]
): Promise<{ matchedSkills: string[]; score: number }> {
  
  if (candidateSkills.length === 0 || requiredKeywords.length === 0) {
      return { matchedSkills: [], score: 0 };
  }

  const prompt = `You are a skill matching expert. Compare the candidate's skills against the required keywords. Consider synonyms and related terms (e.g., "AWS" matches "Amazon Web Services").

Candidate Skills:
${candidateSkills.join(', ')}

Required Keywords:
${requiredKeywords.join(', ')}

Return ONLY valid JSON in this format:
{
  "matchedSkills": ["list of required keywords that were matched"],
  "score": 0-100
}

The score should be an integer representing (number of *unique* required keywords matched / total number of required keywords) * 100.
For example, if 2 out of 3 required keywords are matched, the score is 67.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a skill matching expert that returns only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    const parsed = JSON.parse(content);
    
    const score = typeof parsed.score === 'number' ? Math.round(parsed.score) : 0;

    return {
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      score: score,
    };
  } catch (error: any) {
    console.error('Skill matching error:', error.message);
    return { matchedSkills: [], score: 0 };
  }
}
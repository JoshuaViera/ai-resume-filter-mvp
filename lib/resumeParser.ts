import OpenAI from 'openai';
import { ExtractedResumeData } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseResumeWithAI(
  resumeText: string,
  fileName: string
): Promise<ExtractedResumeData> {
  const prompt = `You are a resume parsing expert. Extract the following information from this resume and return it as valid JSON:

Resume Text:
${resumeText}

Extract:
1. candidateName (full name)
2. email (email address)
3. phone (phone number)
4. address (full address, prioritize the most recent one)
5. skills (array of technical and professional skills)
6. experience (array of job titles and companies)

Return ONLY valid JSON in this exact format:
{
  "candidateName": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "skills": ["skill1", "skill2"],
  "experience": ["title at company", "title at company"]
}

If any field is not found, use an empty string or empty array.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    const parsed = JSON.parse(content);

    return {
      fileName,
      candidateName: parsed.candidateName || 'Unknown',
      email: parsed.email || '',
      phone: parsed.phone || '',
      address: parsed.address || '',
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      rawText: resumeText,
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    throw new Error('Failed to parse resume with AI');
  }
}

export async function scoreSkillMatch(
  candidateSkills: string[],
  requiredKeywords: string[]
): Promise<{ matchedSkills: string[]; score: number }> {
  const prompt = `You are a skill matching expert. Compare the candidate's skills against the required keywords and determine matches, considering synonyms and related terms.

Candidate Skills: ${candidateSkills.join(', ')}
Required Keywords: ${requiredKeywords.join(', ')}

Return ONLY valid JSON in this format:
{
  "matchedSkills": ["matched skill or keyword"],
  "score": 0-100
}

Score should be: (number of matches / total required keywords) * 100`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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

    return {
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      score: typeof parsed.score === 'number' ? parsed.score : 0,
    };
  } catch (error) {
    console.error('Skill matching error:', error);
    return { matchedSkills: [], score: 0 };
  }
}
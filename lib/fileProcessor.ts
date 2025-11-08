import pdf from 'pdf-parse';
import mammoth from 'mammoth';
// Required for pdf-parse in Next.js edge runtime or similar environments
// If running in standard Node.js, Buffer is global.
// This ensures compatibility.
import { Buffer } from 'buffer';

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  switch (fileExtension) {
    case 'pdf':
      // pdf-parse expects a Buffer
      return await extractTextFromPDF(Buffer.from(buffer));
    case 'doc':
    case 'docx':
      return await extractTextFromDOCX(buffer);
    case 'txt':
      return await extractTextFromTXT(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractTextFromDOCX(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({
      arrayBuffer: buffer,
    });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to extract text from DOCX/DOC');
  }
}

async function extractTextFromTXT(buffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  } catch (error) {
    console.error('TXT parsing error:', error);
    throw new Error('Failed to decode TXT file');
  }
}
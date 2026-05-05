import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(
  file: File | string, // Can be a File object or an image URL/base64 string
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100), m.status);
      }
    }
  });

  try {
    const { data: { text } } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}

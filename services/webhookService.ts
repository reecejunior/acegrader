import { Rubric, GradingResult, SubmissionInput } from "../types";
import { parseRubric, gradeStudentWork } from "./geminiService";

// URL for the specific Make.com webhook
const WEBHOOK_URL = "https://hook.eu1.make.com/v711oxn9x8j6swzi7bw4kmfifhzej3oy";
const API_KEY = "Tanatswa2025";

// Helper for timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

/**
 * Sends rubric content to Webhook for structural parsing.
 * Falls back to local Gemini service on failure.
 */
export const sendRubricToWebhook = async (
  input: SubmissionInput,
  userId: string
): Promise<Rubric> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for Webhook

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-make-apikey": API_KEY,
        "x-action": "parse_rubric"
      },
      body: JSON.stringify({
        content: input.content,
        mimeType: input.mimeType,
        fileName: input.fileName,
        type: input.type,
        userId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
    }

    const data = await response.json();
    return data as Rubric;

  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Webhook failed or timed out, falling back to Gemini:", error);
    
    // Fallback: Use Gemini with a 20s timeout constraint
    return await withTimeout(
      parseRubric(input), 
      20000, 
      "AI Analysis timed out. Please try a smaller text or file."
    );
  }
};

/**
 * Sends papers to Webhook for grading.
 * Falls back to local Gemini service on failure.
 */
export const sendPapersToWebhook = async (
  inputs: SubmissionInput[],
  rubric: Rubric,
  contextPaper: SubmissionInput | null,
  userId: string,
  fileUrls: Record<string, string> // Map fileName -> storageURL
): Promise<GradingResult[]> => {
  
  const controller = new AbortController();
  // 15s timeout for Webhook grading (Webhook is faster usually)
  const timeoutId = setTimeout(() => controller.abort(), 15000); 

  try {
    const payload = {
      rubric,
      submissions: inputs.map(inp => ({
        fileName: inp.fileName,
        mimeType: inp.mimeType,
        studentName: inp.studentName,
        className: inp.className,
        content: inp.type === 'text' ? inp.content : null, 
        url: fileUrls[inp.fileName || ''] || null
      })),
      context: contextPaper ? {
        fileName: contextPaper.fileName,
        mimeType: contextPaper.mimeType,
        content: contextPaper.type === 'text' ? contextPaper.content : null,
        url: fileUrls[contextPaper.fileName || ''] || null
      } : null,
      userId
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-make-apikey": API_KEY,
        "x-action": "grade_papers"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
         throw new Error(`Webhook error: ${response.status}`);
    }

    const results = await response.json();
    return results as GradingResult[];

  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Webhook grading failed or timed out, falling back to Gemini:", error);
    
    // Fallback: Loop and grade locally using existing Gemini Service
    // We wrap each call in a timeout to prevent infinite hanging
    const results: GradingResult[] = [];
    
    for (const input of inputs) {
        try {
            // 45s timeout per paper for Local Gemini Grading
            const result = await withTimeout(
                gradeStudentWork(rubric, input, contextPaper || undefined),
                45000,
                "Grading timed out for this submission."
            );
            results.push(result);
        } catch (e) {
            console.error(`Failed to grade ${input.fileName || 'submission'}:`, e);
            throw e; // Rethrow to trigger App.tsx error handling and reset UI
        }
    }
    
    if (results.length === 0) {
        throw new Error("No results generated.");
    }

    return results;
  }
};
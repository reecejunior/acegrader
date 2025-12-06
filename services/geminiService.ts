import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Rubric, GradingResult, SubmissionInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Prompt to parse raw text/file into a structured rubric
export const parseRubric = async (input: SubmissionInput): Promise<Rubric> => {
  const model = "gemini-2.5-flash";
  
  const parts: any[] = [];
  
  parts.push({ text: `Extract grading criteria from the following rubric document/text. 
    Ensure you capture the maximum points for each criterion.
    
    IMPORTANT: Also extract 'keyPointers' - a list of 3-5 critical things the teacher is looking for in this specific assignment (e.g. "Strong Thesis Statement", "Use of Primary Sources", etc).` });

  // Handle Multimodal Input (PDFs, Images) vs Text
  if (input.type === 'file' && input.mimeType) {
    parts.push({ inlineData: { mimeType: input.mimeType, data: input.content } });
  } else {
    parts.push({ text: `Rubric Content:\n${input.content}` });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: "You are Ace Grader's Rubric Parser. Your job is to extract structured grading data with surgical precision from the provided document or text.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A concise title for the assignment/rubric" },
          description: { type: Type.STRING, description: "A one sentence summary of the rubric's purpose" },
          keyPointers: {
            type: Type.ARRAY,
            description: "3 to 5 short bullet points summarizing the most important requirements.",
            items: { type: Type.STRING }
          },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                maxPoints: { type: Type.NUMBER },
                description: { type: Type.STRING, description: "Description of the criteria requirements" }
              },
              required: ["name", "maxPoints", "description"]
            }
          }
        },
        required: ["title", "description", "criteria"]
      }
    }
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Failed to generate rubric structure");
  
  return JSON.parse(jsonText) as Rubric;
};

// Prompt to grade student work based on the confirmed rubric
export const gradeStudentWork = async (
  rubric: Rubric, 
  submission: SubmissionInput,
  questionPaper?: SubmissionInput
): Promise<GradingResult> => {
  const model = "gemini-2.5-flash"; // Multimodal capable

  const rubricContext = JSON.stringify(rubric);
  
  // Construct a multimodal payload
  const parts: any[] = [];

  // 1. Add Rubric
  parts.push({ text: `RUBRIC CONFIGURATION:\n${rubricContext}` });

  // 2. Add Question Paper / Context (If provided)
  if (questionPaper) {
     if (questionPaper.type === 'file' && questionPaper.mimeType) {
         parts.push({ text: "REFERENCE MATERIAL / QUESTION PAPER (For Context):" });
         parts.push({ inlineData: { mimeType: questionPaper.mimeType, data: questionPaper.content } });
     } else {
         parts.push({ text: `REFERENCE MATERIAL / QUESTION PAPER (For Context):\n${questionPaper.content}` });
     }
  }

  // 3. Add Student Submission
  const studentIdentifier = submission.studentName ? `(Student Name Provided: ${submission.studentName})` : "(Student Name Unknown - PLEASE EXTRACT FROM DOCUMENT)";
  
  if (submission.type === 'file' && submission.mimeType) {
    parts.push({ text: `STUDENT SUBMISSION ${studentIdentifier}:` });
    parts.push({ inlineData: { mimeType: submission.mimeType, data: submission.content } });
  } else {
    parts.push({ text: `STUDENT SUBMISSION ${studentIdentifier}:\n${submission.content}` });
  }

  // 4. Instructions
  parts.push({ text: `
    Evaluate the student submission above strictly based on the provided RUBRIC.
    ${questionPaper ? "Use the REFERENCE MATERIAL to understand the specific questions and requirements of the assignment." : ""}
    
    CRITICAL INSTRUCTION FOR META-DATA:
    - Look for the Student's Name and Class/Section at the top of the document. 
    - If found, extract them into the 'studentName' and 'className' fields.
    
    RED PEN ANNOTATIONS:
    - Identify specific errors, grammar mistakes, logic gaps, or brilliant points in the text.
    - Quote the exact text in 'originalText'.
    - Provide a short 'correction' or 'comment'.
  `});

  try {
    const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
        // PERMISSIVE SAFETY SETTINGS to allow "Harsh" grading language
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        systemInstruction: `You are Ace Grader's most HARSH, STRICT, and UNCOMPROMISING Academic Examiner.
        
        GRADING PHILOSOPHY (STRICT):
        1. NO GRADE INFLATION: 100% is for perfection only (publishable quality). 50% is average. 
        2. ZERO TOLERANCE: Penalize vagueness, logic gaps, bad grammar, and weak formatting aggressively.
        3. BE DIRECT: Do not sugarcoat feedback. Point out exactly where they failed.
        4. EVIDENCE REQUIRED: If the student claims something without proof, mark it down.
        
        MANDATORY TRANSCRIPTION:
        - You MUST transcribe the full text of the student's submission into the 'fullTranscribedText' field. 
        - If it is an image or PDF, OCR it exactly. If it is text, copy it.
        
        You must provide:
        1. 'fullTranscribedText': The raw text content of the submission.
        2. A precise breakdown of points (be stingy with points).
        3. 'thinkingProcess': A LIST of strings. Each string is a distinct logical step or observation.
           - Example: ["Thesis is weak.", "Arguments lack citations.", "Conclusion is abrupt."]
        4. An 'improvementTips' list (stern advice).
        5. 'annotations': Specific errors mapped to the text.

        Calculated 'totalScore' must equal the sum of 'pointsEarned'.`,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
            studentName: { type: Type.STRING },
            className: { type: Type.STRING },
            summary: { type: Type.STRING },
            fullTranscribedText: { type: Type.STRING, description: "The exact extracted text from the student submission (OCR if image)." },
            thinkingProcess: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of logical steps taken to determine the grade." 
            },
            improvementTips: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
            },
            annotations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                    originalText: { type: Type.STRING, description: "The exact short phrase or sentence from the student's work." },
                    correction: { type: Type.STRING, description: "The corrected version or short note." },
                    type: { type: Type.STRING, enum: ['error', 'warning', 'praise', 'grammar'] },
                    comment: { type: Type.STRING, description: "A brief explanation of why this is marked." }
                    }
                }
            },
            breakdown: {
                type: Type.ARRAY,
                items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    pointsEarned: { type: Type.NUMBER },
                    maxPoints: { type: Type.NUMBER },
                    justification: { type: Type.STRING }
                },
                required: ["name", "pointsEarned", "maxPoints", "justification"]
                }
            },
            totalScore: { type: Type.NUMBER },
            maxTotalScore: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            teacherNotes: { type: Type.STRING }
            },
            required: ["summary", "fullTranscribedText", "thinkingProcess", "improvementTips", "breakdown", "totalScore", "maxTotalScore", "feedback"]
        }
        }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Failed to generate grading result");
    
    const result = JSON.parse(jsonText) as GradingResult;
    
    // Merge AI extracted data with Manual Override if AI failed or Manual was provided
    if (submission.studentName && (!result.studentName || result.studentName === 'Unknown Student')) {
        result.studentName = submission.studentName;
    }
    if (!result.studentName) result.studentName = "Unknown Student";
    
    if (submission.className && (!result.className || result.className === '')) {
        result.className = submission.className;
    }

    // Preserve content for display
    if (submission.type === 'text') {
        result.originalContent = submission.content;
        result.originalType = 'text';
    } else {
        // Pass the base64 content back just in case, but prefer fullTranscribedText for display
        result.originalContent = submission.content; 
        result.originalType = 'file';
    }

    return result;
  } catch (error) {
    console.error("Gemini Grading Error:", error);
    throw new Error("Grading failed. Please ensure your image is under 20MB and legible.");
  }
};
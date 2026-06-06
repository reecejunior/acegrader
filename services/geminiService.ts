
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Rubric, GradingResult, SubmissionInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJSON = (text: string | undefined): any => {
  if (!text) throw new Error("The AI provided an empty response. Please try again.");
  try {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonStr = text.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonStr);
    }
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing failed. Raw text:", text);
    throw new Error("I couldn't structure the evaluation correctly. Please simplify the submission or try again.");
  }
};

export const parseRubric = async (input: SubmissionInput): Promise<Rubric> => {
  const model = "gemini-3-flash-preview";
  const parts: any[] = [];
  
  parts.push({ text: `Extract grading criteria from the provided content. Identify maximum points. Provide a clear title and description. Extract 'keyPointers' - 3 to 5 critical requirements for success.` });

  if (input.type === 'file' && input.mimeType) {
    parts.push({ inlineData: { mimeType: input.mimeType, data: input.content } });
  } else {
    parts.push({ text: `Rubric Content to analyze:\n${input.content}` });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: "You are a professional academic consultant. Your goal is to convert any text or document containing grading criteria into a clean, valid JSON structure. Be precise with point values.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          keyPointers: { type: Type.ARRAY, items: { type: Type.STRING } },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                maxPoints: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["name", "maxPoints", "description"]
            }
          }
        },
        required: ["title", "description", "criteria"]
      }
    }
  });

  return extractJSON(response.text) as Rubric;
};

export const gradeStudentWork = async (
  rubric: Rubric, 
  submission: SubmissionInput,
  questionPaper?: SubmissionInput,
  pastCorrections?: any[]
): Promise<GradingResult> => {
  const model = "gemini-3-pro-preview";
  const parts: any[] = [];

  parts.push({ text: `EVALUATION PROTOCOL:
  1. RUBRIC: ${JSON.stringify(rubric)}
  2. CONTEXT: ${questionPaper ? 'Question Paper provided below.' : 'No context provided.'}
  3. MISSION: You are a Precision Marking Engine. Your goal is to provide a COMPLETE and EXHAUSTIVE marked document.
  4. ANNOTATIONS: You must find at least 5-10 specific points in the text to annotate (praise, errors, or suggestions).
  5. TRANSCRIPTION: Provide the FULL transcribed text of the student's work.` });

  if (pastCorrections && pastCorrections.length > 0) {
    parts.push({ text: `LEARNING FROM TEACHER PREFERENCES: ${JSON.stringify(pastCorrections)}` });
  }

  if (questionPaper) {
     if (questionPaper.type === 'file' && questionPaper.mimeType) {
         parts.push({ inlineData: { mimeType: questionPaper.mimeType, data: questionPaper.content } });
     } else {
         parts.push({ text: `ASSIGNMENT PROMPT: ${questionPaper.content}` });
     }
  }

  parts.push({ text: "STUDENT SUBMISSION:" });
  if (submission.type === 'file' && submission.mimeType) {
    parts.push({ inlineData: { mimeType: submission.mimeType, data: submission.content } });
  } else {
    parts.push({ text: submission.content });
  }

  try {
    const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 4000 },
        systemInstruction: `You are Ace Grader: The analytic and precise academic evaluator.
        
        CRITICAL OUTPUT REQUIREMENTS:
        - 'fullTranscribedText': Must be the COMPLETE student essay/response. Do not truncate.
        - 'annotations': Provide exhaustive margin notes. Every major claim or error should be tagged.
        - Tone: Professional, analytic, but fair.
        - Format: JSON strictly adhering to the schema.
        `,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
            studentName: { type: Type.STRING },
            className: { type: Type.STRING },
            summary: { type: Type.STRING },
            fullTranscribedText: { type: Type.STRING },
            thinkingProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            annotations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        originalText: { type: Type.STRING },
                        correction: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['error', 'warning', 'praise', 'grammar'] },
                        comment: { type: Type.STRING }
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
            feedback: { type: Type.STRING }
            },
            required: ["summary", "fullTranscribedText", "annotations", "breakdown", "totalScore", "maxTotalScore", "feedback"]
        }
        }
    });

    const result = extractJSON(response.text) as GradingResult;
    result.originalContent = submission.content;
    result.originalType = submission.type;
    return result;
  } catch (error: any) {
    console.error("Critical error in gradeStudentWork:", error);
    throw new Error(error.message || "I encountered an issue while communicating with the grading engine.");
  }
};

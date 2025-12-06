
export interface RubricCriterion {
  name: string;
  maxPoints: number;
  description: string;
}

export interface Rubric {
  id?: string; // Firestore ID
  ownerId?: string; // User ID
  subject?: string; // e.g., "History", "English"
  createdAt?: number;
  title: string;
  description: string;
  criteria: RubricCriterion[];
  keyPointers?: string[]; // Added: AI extracted key focus areas
}

export interface GradeCriterionResult {
  name: string;
  pointsEarned: number;
  maxPoints: number;
  justification: string;
}

export interface Annotation {
  originalText: string;
  correction: string;
  type: 'error' | 'warning' | 'praise' | 'grammar';
  comment: string;
}

export interface GradingResult {
  studentName: string; 
  className?: string; // Added
  submissionId?: string; 
  timestamp?: number; 
  summary: string;
  thinkingProcess: string[]; // Changed from string to string[] for bullet points
  improvementTips: string[];
  annotations?: Annotation[]; // Added for Red Pen mode
  breakdown: GradeCriterionResult[];
  totalScore: number;
  maxTotalScore: number;
  feedback: string;
  teacherNotes?: string;
  originalContent?: string; // To re-display text
  fullTranscribedText?: string; // Added: OCR Text from image
  originalType?: 'text' | 'file';
}

export interface SubmissionInput {
  type: 'text' | 'file';
  content: string;
  mimeType?: string;
  fileName?: string;
  studentName: string;
  className?: string; // Added
}

export interface SubmissionRecord {
  id: string;
  rubricId: string;
  rubricTitle: string;
  ownerId: string;
  studentName: string;
  className?: string; // Added
  totalScore: number;
  maxTotalScore: number;
  summary: string;
  timestamp: number;
  fullResult: GradingResult;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE_RUBRIC = 'CREATE_RUBRIC',
  GRADING = 'GRADING',
  STUDENTS = 'STUDENTS', // Added
}

export interface RubricCriterion {
  name: string;
  maxPoints: number;
  description: string;
}

export interface TeacherCorrection {
  originalScore: number;
  correctedScore: number;
  originalFeedback: string;
  correctedFeedback: string;
  reasonForCorrection: string;
  timestamp: number;
}

export interface Rubric {
  id?: string;
  ownerId?: string;
  subject?: string;
  createdAt?: number;
  title: string;
  description: string;
  criteria: RubricCriterion[];
  keyPointers?: string[];
  pastCorrections?: TeacherCorrection[]; // Used for few-shot learning
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
  className?: string;
  submissionId?: string; 
  timestamp?: number; 
  summary: string;
  thinkingProcess: string[];
  improvementTips: string[];
  annotations?: Annotation[];
  breakdown: GradeCriterionResult[];
  totalScore: number;
  maxTotalScore: number;
  feedback: string;
  teacherNotes?: string;
  originalContent?: string;
  fullTranscribedText?: string;
  originalType?: 'text' | 'file';
  isEditedByTeacher?: boolean;
}

export interface SubmissionInput {
  type: 'text' | 'file';
  content: string;
  mimeType?: string;
  fileName?: string;
  studentName: string;
  className?: string;
}

export interface SubmissionRecord {
  id: string;
  rubricId: string;
  rubricTitle: string;
  ownerId: string;
  studentName: string;
  className?: string;
  totalScore: number;
  maxTotalScore: number;
  summary: string;
  timestamp: number;
  fullResult: GradingResult;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE_RUBRIC = 'CREATE_RUBRIC',
  GRADING = 'GRADING',
  STUDENTS = 'STUDENTS',
}

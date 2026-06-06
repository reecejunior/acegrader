
import { 
  signInAnonymously, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { Rubric, GradingResult, SubmissionRecord, TeacherCorrection } from "../types";

const RUBRICS_COLLECTION = "rubrics";
const SUBMISSIONS_COLLECTION = "submissions";
const CORRECTIONS_COLLECTION = "corrections";

// Mock User for local-only operation when Firebase is blocked by browser security
const createMockUser = (): User => ({
  uid: "local-session-" + Math.random().toString(36).substring(7),
  isAnonymous: true,
  displayName: "Guest Instructor",
  email: "demo@acegrader.atelier",
  emailVerified: true,
  metadata: {},
  providerData: [],
  refreshToken: "",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "local-token",
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({})
} as unknown as User);

export const registerWithEmail = async (name: string, email: string, pass: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
  }
  return userCredential.user;
};

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const loginAsGuest = async (): Promise<User> => {
  try {
    // Attempt Firebase connection with a strict timeout
    const loginPromise = signInAnonymously(auth);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Network Refused")), 2500)
    );
    
    const result = await Promise.race([loginPromise, timeoutPromise]) as any;
    return result.user;
  } catch (error: any) {
    console.warn("Firebase Auth blocked by browser/network. Entering Local Atelier Mode.", error);
    // Silent fallback ensures user is never locked out of the workspace
    return createMockUser();
  }
};

export const saveRubric = async (rubric: Rubric, userId: string): Promise<string> => {
  if (userId.startsWith('local-')) return "mock-rubric-" + Date.now();
  try {
    const docRef = await addDoc(collection(db, RUBRICS_COLLECTION), {
      ...rubric,
      ownerId: userId,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (e) {
    return "local-rubric-" + Date.now();
  }
};

export const getUserRubrics = async (userId: string): Promise<Rubric[]> => {
  if (userId.startsWith('local-')) return [];
  try {
    const q = query(collection(db, RUBRICS_COLLECTION), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rubric));
  } catch (e) {
    return [];
  }
};

export const deleteRubric = async (rubricId: string): Promise<void> => {
  if (rubricId.startsWith('mock-') || rubricId.startsWith('local-')) return;
  await deleteDoc(doc(db, RUBRICS_COLLECTION, rubricId));
};

export const saveSubmission = async (
  userId: string, 
  rubricId: string, 
  rubricTitle: string,
  result: GradingResult
): Promise<string> => {
  if (userId.startsWith('local-')) return "mock-sub-" + Date.now();
  try {
    const submission: Omit<SubmissionRecord, 'id'> = {
      rubricId,
      rubricTitle,
      ownerId: userId,
      studentName: result.studentName,
      className: result.className || 'Unassigned',
      totalScore: result.totalScore,
      maxTotalScore: result.maxTotalScore,
      summary: result.summary,
      timestamp: Date.now(),
      fullResult: result
    };
    const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submission);
    return docRef.id;
  } catch (e) {
    return "local-sub-" + Date.now();
  }
};

export const saveCorrection = async (
  userId: string,
  rubricId: string,
  submissionId: string,
  correction: TeacherCorrection,
  updatedResult: GradingResult
): Promise<void> => {
  if (userId.startsWith('local-')) return;
  try {
    await addDoc(collection(db, CORRECTIONS_COLLECTION), {
      userId, rubricId, submissionId, ...correction
    });
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(submissionRef, {
      fullResult: updatedResult,
      totalScore: updatedResult.totalScore
    });
  } catch (e) {
    console.error("Failed to save correction", e);
  }
};

export const getRubricCorrections = async (userId: string, rubricId: string): Promise<TeacherCorrection[]> => {
  if (userId.startsWith('local-')) return [];
  try {
    const q = query(
      collection(db, CORRECTIONS_COLLECTION), 
      where("userId", "==", userId),
      where("rubricId", "==", rubricId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as TeacherCorrection);
  } catch (e) {
    return [];
  }
};

export const getAllSubmissions = async (userId: string): Promise<SubmissionRecord[]> => {
  if (userId.startsWith('local-')) return [];
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubmissionRecord)).sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
};

export const getSubmissionsForRubric = async (userId: string, rubricId: string): Promise<SubmissionRecord[]> => {
  if (userId.startsWith('local-')) return [];
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), where("ownerId", "==", userId), where("rubricId", "==", rubricId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubmissionRecord)).sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
};

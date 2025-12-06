import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut,
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
  orderBy
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { Rubric, GradingResult, SubmissionRecord } from "../types";

const RUBRICS_COLLECTION = "rubrics";
const SUBMISSIONS_COLLECTION = "submissions";

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

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const loginAsGuest = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/admin-restricted-operation' || error.code === 'auth/operation-not-allowed') {
      console.warn("Firebase Anonymous Auth disabled. Falling back to local Mock User.");
      return {
        uid: "guest-mock-" + Date.now(),
        isAnonymous: true,
        email: null,
        displayName: "Guest (Local)",
        emailVerified: false,
        phoneNumber: null,
        photoURL: null,
        providerId: 'firebase',
        metadata: {},
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => "mock-token",
        getIdTokenResult: async () => ({
            token: "mock",
            signInProvider: "anonymous",
            claims: {},
            authTime: "",
            issuedAtTime: "",
            expirationTime: "",
        }),
        reload: async () => {},
        toJSON: () => ({}),
      } as unknown as User;
    }
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const saveRubric = async (rubric: Rubric, userId: string): Promise<string> => {
  if (userId.startsWith('guest-mock')) {
    console.warn("Mock user cannot save to Cloud Firestore.");
    return "mock-rubric-id-" + Date.now();
  }

  const docRef = await addDoc(collection(db, RUBRICS_COLLECTION), {
    ...rubric,
    ownerId: userId,
    createdAt: Date.now()
  });
  return docRef.id;
};

export const getUserRubrics = async (userId: string): Promise<Rubric[]> => {
  if (userId.startsWith('guest-mock')) {
    return [];
  }

  const q = query(collection(db, RUBRICS_COLLECTION), where("ownerId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Rubric));
};

export const deleteRubric = async (rubricId: string): Promise<void> => {
  if (rubricId.startsWith('mock')) return;
  await deleteDoc(doc(db, RUBRICS_COLLECTION, rubricId));
};

// --- SUBMISSIONS ---

export const saveSubmission = async (
  userId: string, 
  rubricId: string, 
  rubricTitle: string,
  result: GradingResult
): Promise<string> => {
  if (userId.startsWith('guest-mock')) {
    console.warn("Mock user cannot save submissions.");
    return "mock-submission-id";
  }

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
};

export const getSubmissionsForRubric = async (userId: string, rubricId: string): Promise<SubmissionRecord[]> => {
  if (userId.startsWith('guest-mock')) return [];

  // Removing server-side ordering to prevent 'Missing Index' errors
  // Sorting is done in memory
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION), 
    where("ownerId", "==", userId),
    where("rubricId", "==", rubricId)
  );

  const querySnapshot = await getDocs(q);
  const records = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SubmissionRecord));

  // Sort descending by timestamp
  return records.sort((a, b) => b.timestamp - a.timestamp);
};

export const getAllSubmissions = async (userId: string): Promise<SubmissionRecord[]> => {
  if (userId.startsWith('guest-mock')) return [];

  // Removing server-side ordering to prevent 'Missing Index' errors
  // Sorting is done in memory
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION), 
    where("ownerId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  const records = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SubmissionRecord));

  // Sort descending by timestamp
  return records.sort((a, b) => b.timestamp - a.timestamp);
};
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import { SubmissionInput } from "../types";

export const uploadPaper = async (
  input: SubmissionInput,
  userId: string,
  rubricId?: string
): Promise<{ path: string; url: string }> => {
  if (userId.startsWith('guest-mock')) {
    // Mock upload for guest users
    return { path: `mock/papers/${Date.now()}_${input.fileName}`, url: '' };
  }

  const safeFileName = (input.fileName || 'submission').replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `papers/${userId}/${rubricId || 'temp'}/${Date.now()}_${safeFileName}`;
  const storageRef = ref(storage, path);
  
  // input.content is expected to be a base64 string
  await uploadString(storageRef, input.content, 'base64', { contentType: input.mimeType });
  const url = await getDownloadURL(storageRef);
  
  return { path, url };
};

export const uploadContextPaper = async (
  input: SubmissionInput,
  userId: string
): Promise<{ path: string; url: string }> => {
  if (userId.startsWith('guest-mock')) {
    return { path: `mock/context/${Date.now()}_${input.fileName}`, url: '' };
  }

  const safeFileName = (input.fileName || 'context').replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `context/${userId}/${Date.now()}_${safeFileName}`;
  const storageRef = ref(storage, path);
  
  await uploadString(storageRef, input.content, 'base64', { contentType: input.mimeType });
  const url = await getDownloadURL(storageRef);
  
  return { path, url };
};

export const deletePaper = async (path: string) => {
  if (path.startsWith('mock/')) return;
  const storageRef = ref(storage, path);
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
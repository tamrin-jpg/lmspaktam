import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Subscribe to realtime updates of a Firestore collection.
 * Returns an unsubscribe function.
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as T);
        });
        onData(items);
      },
      (error) => {
        console.warn(`Firestore listener warning on "${collectionName}":`, error.message);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Could not attach listener for ${collectionName}:`, err);
    return () => {};
  }
}

/**
 * Save or overwrite a document in Firestore.
 */
export async function saveDocument<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`Failed to save document to Firestore [${collectionName}/${docId}]:`, err);
  }
}

/**
 * Delete a document from Firestore.
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Failed to delete document from Firestore [${collectionName}/${docId}]:`, err);
  }
}

/**
 * Batch save multiple documents (e.g. bulk import).
 */
export async function batchSaveDocuments<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.warn(`Failed batch save to Firestore [${collectionName}]:`, err);
  }
}

/**
 * Delete all documents in a collection (e.g. for reset).
 */
export async function clearCollection(collectionName: string): Promise<void> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return;
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err) {
    console.warn(`Failed to clear Firestore collection [${collectionName}]:`, err);
  }
}

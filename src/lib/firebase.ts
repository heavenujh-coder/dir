import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { DiaryEntry } from '../types/diary';

export const firebaseConfig = {
  apiKey: "AIzaSyCzP5V9Wnv9bNYkBO1tkLPW1XvuxsxtkE0",
  authDomain: "visit-33803.firebaseapp.com",
  projectId: "visit-33803",
  storageBucket: "visit-33803.firebasestorage.app",
  messagingSenderId: "16947816432",
  appId: "1:16947816432:web:e7bbd8467cfdbe097e1f35"
};

// Initialize Firebase App instance safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const LOCAL_STORAGE_KEY = 'warm_daily_diaries_v2';
const COLLECTION_NAME = 'daily_diaries';

// Helper to get local storage entries
export const getLocalDiaries = (): DiaryEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
    return [];
  }
};

// Helper to save local storage entries
export const saveLocalDiaries = (diaries: DiaryEntry[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diaries));
  } catch (e) {
    console.warn('Failed to write to localStorage:', e);
  }
};

// Save a diary entry: Attempts Firebase Firestore, always writes to localStorage
export async function saveDiaryEntry(entry: Omit<DiaryEntry, 'id'> & { id?: string }): Promise<DiaryEntry> {
  const localId = entry.id || 'diary_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newEntry: DiaryEntry = {
    ...entry,
    id: localId,
  };

  // 1. Immediately cache in localStorage for instant responsiveness & offline support
  const localList = getLocalDiaries();
  const updatedLocal = [newEntry, ...localList.filter((d) => d.id !== localId)];
  saveLocalDiaries(updatedLocal);

  // 2. Persist to Firebase Firestore
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, {
      ...newEntry,
      firebaseCreatedAt: new Date(),
    });
    // Update local entry with Firestore document ID if generated
    if (docRef.id) {
      newEntry.id = docRef.id;
      const remapped = updatedLocal.map((d) => (d.id === localId ? newEntry : d));
      saveLocalDiaries(remapped);
    }
  } catch (err) {
    console.warn('Firestore write warning (using secure local backup):', err);
  }

  return newEntry;
}

// Fetch all diary entries: loads from Firestore and syncs with local storage
export async function fetchDiaryEntries(): Promise<{ entries: DiaryEntry[]; isCloudSynced: boolean }> {
  const localEntries = getLocalDiaries();

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const cloudEntries: DiaryEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          date: data.date,
          displayDate: data.displayDate,
          emotion: data.emotion,
          content: data.content,
          response: data.response,
          actionCompleted: Boolean(data.actionCompleted),
          actionCompletedAt: data.actionCompletedAt,
          createdAt: data.createdAt || Date.now(),
          isFavorite: Boolean(data.isFavorite),
        } as DiaryEntry;
      });

      // Merge cloud and local, avoiding duplicates
      const map = new Map<string, DiaryEntry>();
      cloudEntries.forEach((entry) => map.set(entry.id, entry));
      localEntries.forEach((entry) => {
        if (!map.has(entry.id)) {
          map.set(entry.id, entry);
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
      saveLocalDiaries(merged);
      return { entries: merged, isCloudSynced: true };
    }
  } catch (err) {
    console.warn('Firestore read notice (falling back to saved entries):', err);
  }

  return { entries: localEntries, isCloudSynced: false };
}

// Delete diary entry
export async function deleteDiaryEntry(id: string): Promise<void> {
  // Update local storage
  const current = getLocalDiaries();
  const filtered = current.filter((d) => d.id !== id);
  saveLocalDiaries(filtered);

  // Attempt Firestore deletion
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (e) {
    console.warn('Firestore delete notice:', e);
  }
}

// Toggle action completed status
export async function updateActionCompleted(id: string, completed: boolean): Promise<void> {
  const current = getLocalDiaries();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        actionCompleted: completed,
        actionCompletedAt: completed ? Date.now() : undefined,
      };
    }
    return item;
  });
  saveLocalDiaries(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      actionCompleted: completed,
      actionCompletedAt: completed ? Date.now() : null,
    });
  } catch (e) {
    console.warn('Firestore update notice:', e);
  }
}

// Toggle favorite
export async function toggleFavorite(id: string): Promise<boolean> {
  const current = getLocalDiaries();
  let nextState = false;
  const updated = current.map((item) => {
    if (item.id === id) {
      nextState = !item.isFavorite;
      return { ...item, isFavorite: nextState };
    }
    return item;
  });
  saveLocalDiaries(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isFavorite: nextState });
  } catch (e) {
    console.warn('Firestore favorite update notice:', e);
  }

  return nextState;
}

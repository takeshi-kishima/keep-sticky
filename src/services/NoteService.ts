import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from '../types';

function notesCol(uid: string) {
  return collection(db, 'users', uid, 'notes');
}

export function subscribeToNotes(
  uid: string,
  callback: (notes: Note[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(notesCol(uid), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const notes: Note[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? '',
          content: data.content ?? '',
          color: data.color ?? '#fff9c4',
          labels: data.labels ?? [],
          isPinned: data.isPinned ?? false,
          isArchived: data.isArchived ?? false,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        };
      });
      callback(notes);
    },
    (error) => {
      console.error('Notes subscription error:', error);
      onError?.(error);
    },
  );
}

export async function createNote(uid: string, data: CreateNoteRequest): Promise<string> {
  const docRef = await addDoc(notesCol(uid), {
    title: data.title ?? '',
    content: data.content ?? '',
    color: data.color ?? '#fff9c4',
    labels: data.labels ?? [],
    isPinned: data.isPinned ?? false,
    isArchived: data.isArchived ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateNote(uid: string, noteId: string, data: UpdateNoteRequest): Promise<void> {
  const ref = doc(db, 'users', uid, 'notes', noteId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(uid: string, noteId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'notes', noteId);
  await deleteDoc(ref);
}

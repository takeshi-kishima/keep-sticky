import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { StickyNote, Position, Size } from '../types';

function stickiesCol(uid: string) {
  return collection(db, 'users', uid, 'stickies');
}

export function subscribeToStickies(
  uid: string,
  callback: (stickies: StickyNote[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(stickiesCol(uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const stickies: StickyNote[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          noteId: data.noteId,
          position: data.position ?? { x: 100, y: 100 },
          size: data.size ?? { width: 250, height: 300 },
          isMinimized: data.isMinimized ?? false,
          zIndex: data.zIndex ?? 1000,
        };
      });
      callback(stickies);
    },
    (error) => {
      console.error('Stickies subscription error:', error);
      onError?.(error);
    },
  );
}

export async function createSticky(
  uid: string,
  noteId: string,
  position: Position = { x: 100, y: 100 },
  size: Size = { width: 250, height: 300 },
): Promise<string> {
  const docRef = await addDoc(stickiesCol(uid), {
    noteId,
    position,
    size,
    isMinimized: false,
    zIndex: Date.now(),
  });
  return docRef.id;
}

export async function updateStickyPosition(uid: string, id: string, position: Position): Promise<void> {
  const ref = doc(db, 'users', uid, 'stickies', id);
  await updateDoc(ref, { position });
}

export async function updateStickySize(uid: string, id: string, size: Size): Promise<void> {
  const ref = doc(db, 'users', uid, 'stickies', id);
  const constrainedSize: Size = {
    width: Math.max(size.width, 200),
    height: Math.max(size.height, 150),
  };
  await updateDoc(ref, { size: constrainedSize });
}

export async function closeSticky(uid: string, id: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'stickies', id);
  await deleteDoc(ref);
}

export async function toggleStickyMinimized(uid: string, id: string, current: boolean): Promise<void> {
  const ref = doc(db, 'users', uid, 'stickies', id);
  await updateDoc(ref, { isMinimized: !current });
}

export async function bringToFront(uid: string, id: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'stickies', id);
  await updateDoc(ref, { zIndex: Date.now() });
}

export async function deleteStickiesForNote(uid: string, noteId: string): Promise<void> {
  const q = query(stickiesCol(uid), where('noteId', '==', noteId));
  const snapshot = await getDocs(q);
  const deletes = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);
}

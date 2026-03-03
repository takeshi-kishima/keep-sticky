import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth';
import { subscribeToNotes, createNote, updateNote, deleteNote } from '../services/NoteService';
import { deleteStickiesForNote } from '../services/StickyService';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from '../types';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToNotes(
      user.id,
      (updatedNotes) => {
        setNotes(updatedNotes);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const addNote = async (data: CreateNoteRequest): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return createNote(user.id, data);
  };

  const editNote = async (noteId: string, data: UpdateNoteRequest): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return updateNote(user.id, noteId, data);
  };

  const removeNote = async (noteId: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    await deleteStickiesForNote(user.id, noteId);
    await deleteNote(user.id, noteId);
  };

  return { notes, isLoading, error, addNote, editNote, removeNote };
}

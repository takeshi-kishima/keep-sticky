import React from 'react';
import { NoteCard } from './NoteCard';
import type { Note } from '../../types';

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  onNoteSelect: (note: Note) => void;
  onCreateSticky: (noteId: string) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  isLoading,
  error,
  onNoteSelect,
  onCreateSticky,
}) => {
  if (isLoading) {
    return (
      <div className="notes-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notes-error">
        <div className="error-content">
          <h3>Failed to load notes</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="notes-empty">
        <p>No notes yet. Create one!</p>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onSelect={() => onNoteSelect(note)}
          onMakeSticky={() => onCreateSticky(note.id)}
        />
      ))}
    </div>
  );
};

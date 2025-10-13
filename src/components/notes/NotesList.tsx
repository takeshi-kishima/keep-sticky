import React, { useState, useEffect } from 'react';
import { NoteCard } from './NoteCard';
import { GoogleKeepApiService } from '../../services';
import type { Note } from '../../types';

interface NotesListProps {
  onNoteSelect: (note: Note) => void;
  onCreateSticky: (noteId: string) => void;
  apiService: GoogleKeepApiService;
}

/**
 * Notes List Component
 * Displays grid of notes from Google Keep
 */
export const NotesList: React.FC<NotesListProps> = ({ 
  onNoteSelect, 
  onCreateSticky, 
  apiService 
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedNotes = await apiService.fetchNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
      setError(errorMessage);
      console.error('Failed to load notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadNotes();
  };

  if (isLoading) {
    return (
      <div className="notes-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your notes...</p>
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
          <button 
            onClick={handleRefresh}
            className="retry-button"
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="notes-empty">
        <div className="empty-content">
          <div className="empty-icon">📝</div>
          <h3>No notes found</h3>
          <p>Your Google Keep notes will appear here.</p>
          <button 
            onClick={handleRefresh}
            className="refresh-button"
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-list">
      <div className="notes-header">
        <h2>Your Notes ({notes.length})</h2>
        <button 
          onClick={handleRefresh}
          className="refresh-button"
          type="button"
          title="Refresh notes"
        >
          🔄
        </button>
      </div>

      <div className="notes-grid">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onSelect={() => onNoteSelect(note)}
            onMakeSticky={() => onCreateSticky(note.id)}
          />
        ))}
      </div>
    </div>
  );
};
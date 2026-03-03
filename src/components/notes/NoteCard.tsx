import React from 'react';
import type { Note } from '../../types';

interface NoteCardProps {
  note: Note;
  onSelect: () => void;
  onMakeSticky: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onSelect, onMakeSticky }) => {
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="note-card"
      style={{ backgroundColor: note.color }}
      onClick={onSelect}
    >
      <div className="note-card-header">
        {note.title && (
          <h3 className="note-title">{truncateText(note.title, 50)}</h3>
        )}
        <div className="note-actions">
          {note.isPinned && (
            <span className="pin-indicator" title="Pinned">
              pinned
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMakeSticky();
            }}
            className="sticky-button"
            title="Open as sticky note"
            type="button"
          >
            Stick
          </button>
        </div>
      </div>

      <div className="note-content">
        <p>{truncateText(note.content)}</p>
      </div>

      {note.labels.length > 0 && (
        <div className="note-labels">
          {note.labels.map((label) => (
            <span key={label} className="note-label">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

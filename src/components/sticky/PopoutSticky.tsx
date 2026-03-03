import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { useNotes } from '../../hooks/useNotes';

export const PopoutSticky: React.FC<{ noteId: string }> = ({ noteId }) => {
  const { isAuthenticated } = useAuth();
  const { notes, isLoading, editNote } = useNotes();
  const note = notes.find((n) => n.id === noteId);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
      document.title = note.title || 'Untitled';
    }
  }, [note?.title, note?.content]);

  if (!isAuthenticated) {
    return <div className="popout-loading">Authenticating...</div>;
  }

  if (isLoading) {
    return <div className="popout-loading">Loading...</div>;
  }

  if (!note) {
    return <div className="popout-loading">Note not found.</div>;
  }

  const commitEdit = () => {
    if (editTitle !== note.title || editContent !== note.content) {
      editNote(noteId, { title: editTitle, content: editContent });
    }
    setIsEditingTitle(false);
    setIsEditingContent(false);
  };

  return (
    <div className="popout-sticky" style={{ backgroundColor: note.color }}>
      <div className="popout-title" onDoubleClick={() => setIsEditingTitle(true)}>
        {isEditingTitle ? (
          <input
            className="popout-inline-edit"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
            autoFocus
          />
        ) : (
          <span>{note.title || 'Untitled'}</span>
        )}
      </div>

      <div className="popout-content" onDoubleClick={() => setIsEditingContent(true)}>
        {isEditingContent ? (
          <textarea
            className="popout-inline-edit"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={commitEdit}
            autoFocus
          />
        ) : (
          <div className="popout-text">{note.content}</div>
        )}
      </div>

      {note.labels.length > 0 && (
        <div className="popout-labels">
          {note.labels.map((label) => (
            <span key={label} className="sticky-label">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

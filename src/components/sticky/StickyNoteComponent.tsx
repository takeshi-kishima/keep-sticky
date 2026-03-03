import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Note, StickyNote, Position, Size } from '../../types';

interface StickyNoteProps {
  note: Note;
  stickyNote: StickyNote;
  onPositionChange: (position: Position) => void;
  onSizeChange: (size: Size) => void;
  onClose: () => void;
  onMinimize: () => void;
  onBringToFront: () => void;
  onNoteEdit?: (title: string, content: string) => void;
}

export const StickyNoteComponent: React.FC<StickyNoteProps> = ({
  note,
  stickyNote,
  onPositionChange,
  onSizeChange,
  onClose,
  onMinimize,
  onBringToFront,
  onNoteEdit,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [localPos, setLocalPos] = useState(stickyNote.position);
  const [localSize, setLocalSize] = useState(stickyNote.size);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Sync from props when not dragging/resizing
  useEffect(() => {
    if (!isDragging) setLocalPos(stickyNote.position);
  }, [stickyNote.position, isDragging]);

  useEffect(() => {
    if (!isResizing) setLocalSize(stickyNote.size);
  }, [stickyNote.size, isResizing]);

  useEffect(() => {
    setEditTitle(note.title);
    setEditContent(note.content);
  }, [note.title, note.content]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('sticky-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - localPos.x,
        y: e.clientY - localPos.y,
      });
      onBringToFront();
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const maxX = window.innerWidth - localSize.width;
        const maxY = window.innerHeight - localSize.height;
        setLocalPos({
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, maxX)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, maxY)),
        });
      }
    },
    [isDragging, dragOffset, localSize],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(localPos);
    }
    if (isResizing) {
      setIsResizing(false);
      onSizeChange(localSize);
    }
  }, [isDragging, isResizing, localPos, localSize, onPositionChange, onSizeChange]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    onBringToFront();
  };

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && stickyRef.current) {
        const rect = stickyRef.current.getBoundingClientRect();
        setLocalSize({
          width: Math.max(200, e.clientX - rect.left),
          height: Math.max(150, e.clientY - rect.top),
        });
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleResize]);

  const commitEdit = () => {
    if (onNoteEdit && (editTitle !== note.title || editContent !== note.content)) {
      onNoteEdit(editTitle, editContent);
    }
    setIsEditingTitle(false);
    setIsEditingContent(false);
  };

  if (stickyNote.isMinimized) {
    return (
      <div
        className="sticky-note minimized"
        style={{
          left: localPos.x,
          top: localPos.y,
          zIndex: stickyNote.zIndex,
          backgroundColor: note.color,
        }}
        onClick={() => onMinimize()}
      >
        <div className="sticky-minimized-content">
          <span className="sticky-title">{note.title || 'Untitled'}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="sticky-close"
            type="button"
          >
            &times;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={stickyRef}
      className="sticky-note"
      style={{
        left: localPos.x,
        top: localPos.y,
        width: localSize.width,
        height: localSize.height,
        zIndex: stickyNote.zIndex,
        backgroundColor: note.color,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="sticky-header">
        <div className="sticky-title" onDoubleClick={() => setIsEditingTitle(true)}>
          {isEditingTitle ? (
            <input
              className="sticky-inline-edit"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
              autoFocus
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            note.title || 'Untitled'
          )}
        </div>
        <div className="sticky-controls">
          <button onClick={onMinimize} className="sticky-minimize" type="button" title="Minimize">
            &minus;
          </button>
          <button onClick={onClose} className="sticky-close" type="button" title="Close">
            &times;
          </button>
        </div>
      </div>

      <div className="sticky-content" onDoubleClick={() => setIsEditingContent(true)}>
        {isEditingContent ? (
          <textarea
            className="sticky-inline-edit"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={commitEdit}
            autoFocus
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="sticky-text">{note.content}</div>
        )}

        {note.labels.length > 0 && (
          <div className="sticky-labels">
            {note.labels.map((label) => (
              <span key={label} className="sticky-label">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="sticky-resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
};

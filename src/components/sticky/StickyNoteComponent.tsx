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
}

/**
 * Sticky Note Component
 * Displays a note in a draggable, resizable window
 */
export const StickyNoteComponent: React.FC<StickyNoteProps> = ({
  note,
  stickyNote,
  onPositionChange,
  onSizeChange,
  onClose,
  onMinimize,
  onBringToFront
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const stickyRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('sticky-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - stickyNote.position.x,
        y: e.clientY - stickyNote.position.y
      });
      onBringToFront();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - stickyNote.size.width;
      const maxY = window.innerHeight - stickyNote.size.height;
      
      newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
      newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
      
      onPositionChange(newPosition);
    }
  }, [isDragging, dragOffset, stickyNote.size, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    onBringToFront();
  };

  const handleResize = useCallback((e: MouseEvent) => {
    if (isResizing && stickyRef.current) {
      const rect = stickyRef.current.getBoundingClientRect();
      const newSize = {
        width: Math.max(200, e.clientX - rect.left),
        height: Math.max(150, e.clientY - rect.top)
      };
      
      onSizeChange(newSize);
    }
  }, [isResizing, onSizeChange]);

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

  if (stickyNote.isMinimized) {
    return (
      <div
        className="sticky-note minimized"
        style={{
          left: stickyNote.position.x,
          top: stickyNote.position.y,
          zIndex: stickyNote.zIndex,
          backgroundColor: note.color
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
            ×
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
        left: stickyNote.position.x,
        top: stickyNote.position.y,
        width: stickyNote.size.width,
        height: stickyNote.size.height,
        zIndex: stickyNote.zIndex,
        backgroundColor: note.color
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="sticky-header">
        <div className="sticky-title">
          {note.title || 'Untitled'}
        </div>
        <div className="sticky-controls">
          <button
            onClick={onMinimize}
            className="sticky-minimize"
            type="button"
            title="Minimize"
          >
            −
          </button>
          <button
            onClick={onClose}
            className="sticky-close"
            type="button"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="sticky-content">
        <div className="sticky-text">
          {note.content}
        </div>
        
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

      <div
        className="sticky-resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};
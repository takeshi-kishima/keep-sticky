import React, { useState, useEffect } from 'react';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from '../../types';

const COLORS = [
  '#fff9c4', '#f8bbd0', '#c8e6c9', '#b3e5fc',
  '#d1c4e9', '#ffe0b2', '#ffffff', '#cfd8dc',
];

interface NoteEditorProps {
  note?: Note;
  onSave: (data: CreateNoteRequest | UpdateNoteRequest) => Promise<void>;
  onDelete?: (noteId: string) => Promise<void>;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#fff9c4');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
      setLabels(note.labels);
      setIsPinned(note.isPinned);
    }
  }, [note]);

  const handleAddLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ title, content, color, labels, isPinned });
      onClose();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'New Note'}</h2>
          <button className="modal-close" onClick={onClose} type="button">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className="editor-title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="editor-content"
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />

          <div className="editor-section">
            <label className="editor-label">Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  type="button"
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="editor-section">
            <label className="editor-label">Labels</label>
            <div className="label-input-row">
              <input
                type="text"
                className="label-input"
                placeholder="Add label..."
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={handleLabelKeyDown}
              />
              <button className="label-add-btn" onClick={handleAddLabel} type="button">
                +
              </button>
            </div>
            {labels.length > 0 && (
              <div className="labels-list">
                {labels.map((l) => (
                  <span key={l} className="label-chip">
                    {l}
                    <button onClick={() => handleRemoveLabel(l)} type="button">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="editor-section">
            <label className="pin-toggle">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              Pin note
            </label>
          </div>
        </div>

        <div className="modal-footer">
          {note && onDelete && (
            <button
              className="btn btn-danger"
              onClick={async () => {
                await onDelete(note.id);
                onClose();
              }}
              type="button"
            >
              Delete
            </button>
          )}
          <div className="modal-footer-spacer" />
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

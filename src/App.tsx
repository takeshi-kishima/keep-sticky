import { useState } from 'react';
import { AuthProvider, LoginButton, useAuth } from './components/auth';
import { NotesList } from './components/notes/NotesList';
import { NoteEditor } from './components/notes/NoteEditor';
import { StickyNoteComponent } from './components/sticky/StickyNoteComponent';
import { PopoutSticky } from './components/sticky/PopoutSticky';
import { useNotes } from './hooks/useNotes';
import { useStickies } from './hooks/useStickies';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from './types';
import './App.css';

function PopoutView({ noteId }: { noteId: string }) {
  return <PopoutSticky noteId={noteId} />;
}

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const { notes, isLoading, error, addNote, editNote, removeNote } = useNotes();
  const { stickies, addSticky, moveSticky, resizeSticky, removeSticky, toggleMinimized, bringStickyToFront } =
    useStickies();

  const [editorNote, setEditorNote] = useState<Note | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <img src="/logo.svg" alt="Keep Sticky" className="login-logo" />
          <h1>Keep Sticky</h1>
          <p>Sticky notes, synced everywhere.</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  const openNewNote = () => {
    setEditorNote(undefined);
    setIsEditorOpen(true);
  };

  const openEditNote = (note: Note) => {
    setEditorNote(note);
    setIsEditorOpen(true);
  };

  const handleSave = async (data: CreateNoteRequest | UpdateNoteRequest) => {
    if (editorNote) {
      await editNote(editorNote.id, data);
    } else {
      await addNote(data as CreateNoteRequest);
    }
  };

  const handleCreateSticky = async (noteId: string) => {
    const offset = stickies.length * 30;
    await addSticky(noteId, { x: 320 + offset, y: 80 + offset });
  };

  const openPopout = (noteId: string) => {
    window.open(
      `/?popout=${noteId}`,
      `sticky-${noteId}`,
      'width=300,height=400,menubar=no,toolbar=no,location=no,status=no',
    );
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <img src="/logo.svg" alt="Keep Sticky" className="header-logo" />
          <span className="header-title">Keep Sticky</span>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={openNewNote} type="button">
            + New
          </button>
          {user && (
            <div className="user-info">
              {user.picture && <img src={user.picture} alt="" className="user-avatar" referrerPolicy="no-referrer" />}
              <span className="user-name">{user.name}</span>
              <button className="btn btn-secondary btn-sm" onClick={logout} type="button">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Notes ({notes.length})</h2>
          </div>
          <NotesList
            notes={notes}
            isLoading={isLoading}
            error={error}
            onNoteSelect={openEditNote}
            onCreateSticky={handleCreateSticky}
          />
        </aside>

        <main className="canvas">
          {stickies.map((sticky) => {
            const note = notes.find((n) => n.id === sticky.noteId);
            if (!note) return null;
            return (
              <StickyNoteComponent
                key={sticky.id}
                note={note}
                stickyNote={sticky}
                onPositionChange={(pos) => moveSticky(sticky.id, pos)}
                onSizeChange={(size) => resizeSticky(sticky.id, size)}
                onClose={() => removeSticky(sticky.id)}
                onMinimize={() => toggleMinimized(sticky.id, sticky.isMinimized)}
                onBringToFront={() => bringStickyToFront(sticky.id)}
                onNoteEdit={(title, content) => editNote(sticky.noteId, { title, content })}
                onPopout={() => openPopout(sticky.noteId)}
              />
            );
          })}
          {stickies.length === 0 && (
            <div className="canvas-empty">
              <p>Click the pin icon on a note to stick it here.</p>
            </div>
          )}
        </main>
      </div>

      {isEditorOpen && (
        <NoteEditor
          note={editorNote}
          onSave={handleSave}
          onDelete={async (id) => { await removeNote(id); }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const popoutNoteId = params.get('popout');

  return (
    <AuthProvider>
      {popoutNoteId ? <PopoutView noteId={popoutNoteId} /> : <AppContent />}
    </AuthProvider>
  );
}

export default App;

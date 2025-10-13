// Re-export all types for easy importing
export type { User, AuthContextType } from './User';
export type { Note, CreateNoteRequest, UpdateNoteRequest } from './Note';
export type { StickyNote, Position, Size, UpdateStickyRequest } from './StickyNote';
export type { 
  GoogleApiNote, 
  GoogleApiNotesListResponse, 
  GoogleApiNoteResponse,
  GoogleClientConfig,
  GoogleAuthConfig,
  GoogleUserProfile,
  GoogleCurrentUser,
  GoogleAuthInstance,
  GoogleKeepNotesApi
} from './GoogleApi';
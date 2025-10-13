/**
 * Google Keep API response types
 */

export interface GoogleApiNote {
  id: string;
  title?: string;
  content?: string;
  color?: string;
  labels?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  createTime?: string;
  updateTime?: string;
}

export interface GoogleApiNotesListResponse {
  result: {
    notes?: GoogleApiNote[];
    nextPageToken?: string;
  };
}

export interface GoogleApiNoteResponse {
  result: GoogleApiNote;
}

export interface GoogleClientConfig {
  clientId: string;
  discoveryDoc: string;
  scope: string;
}

export interface GoogleAuthConfig {
  client_id: string;
  scope: string;
}

export interface GoogleUserProfile {
  getId(): string;
  getEmail(): string;
  getName(): string;
  getImageUrl(): string;
}

export interface GoogleCurrentUser {
  getBasicProfile(): GoogleUserProfile;
}

export interface GoogleAuthInstance {
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  isSignedIn: {
    get(): boolean;
  };
  currentUser: {
    get(): GoogleCurrentUser;
  };
}

export interface GoogleKeepNotesApi {
  list(): Promise<GoogleApiNotesListResponse>;
  get(params: { noteId: string }): Promise<GoogleApiNoteResponse>;
  create(params: { resource: Partial<GoogleApiNote> }): Promise<GoogleApiNoteResponse>;
  patch(params: { noteId: string; resource: Partial<GoogleApiNote> }): Promise<GoogleApiNoteResponse>;
  delete(params: { noteId: string }): Promise<{ result: Record<string, unknown> }>;
}
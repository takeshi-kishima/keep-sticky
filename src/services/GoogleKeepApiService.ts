import type { 
  User, 
  Note, 
  CreateNoteRequest, 
  UpdateNoteRequest,
  GoogleApiNote,
  GoogleClientConfig,
  GoogleAuthConfig,
  GoogleAuthInstance,
  GoogleKeepNotesApi
} from '../types';

/**
 * Configuration for Google Keep API Service
 */
export interface GoogleKeepApiConfig {
  clientId: string;
  discoveryDoc: string;
  scope: string;
}

/**
 * Service for Google Keep API integration
 */
export class GoogleKeepApiService {
  private config: GoogleKeepApiConfig;
  private initialized = false;

  constructor(config: GoogleKeepApiConfig) {
    this.config = config;
  }

  /**
   * Initialize Google API client
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.gapi) {
        reject(new Error('Google API not available'));
        return;
      }

      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            clientId: this.config.clientId,
            discoveryDoc: this.config.discoveryDoc,
            scope: this.config.scope
          });

          await window.gapi.auth2.init({
            client_id: this.config.clientId,
            scope: this.config.scope
          });

          this.initialized = true;
          resolve();
        } catch (error) {
          reject(new Error(`Failed to initialize Google API: ${error}`));
        }
      });
    });
  }

  /**
   * Authenticate user with Google OAuth
   */
  async authenticate(): Promise<User> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();

      const currentUser = authInstance.currentUser.get();
      const profile = currentUser.getBasicProfile();

      const user: User = {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl()
      };

      return user;
    } catch (error) {
      throw new Error(`Authentication failed: ${error}`);
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    if (!this.initialized) {
      return false;
    }

    try {
      if (typeof window === 'undefined' || !window.gapi || !window.gapi.auth2) {
        return false;
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        return false;
      }

      return authInstance.isSignedIn.get();
    } catch {
      return false;
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    const currentUser = authInstance.currentUser.get();
    const profile = currentUser.getBasicProfile();

    return {
      id: profile.getId(),
      email: profile.getEmail(),
      name: profile.getName(),
      picture: profile.getImageUrl()
    };
  }

  /**
   * Fetch all notes from Google Keep
   */
  async fetchNotes(): Promise<Note[]> {
    this.ensureAuthenticated();

    try {
      const response = await window.gapi.client.keep.notes.list();
      const apiNotes = response.result.notes || [];

      return apiNotes.map(this.transformApiNoteToNote);
    } catch (error) {
      throw new Error(`Failed to fetch notes: ${error}`);
    }
  }

  /**
   * Fetch a specific note by ID
   */
  async fetchNote(id: string): Promise<Note> {
    this.ensureAuthenticated();

    try {
      const response = await window.gapi.client.keep.notes.get({
        noteId: id
      });

      return this.transformApiNoteToNote(response.result);
    } catch (error) {
      throw new Error(`Failed to fetch note ${id}: ${error}`);
    }
  }

  /**
   * Create a new note
   */
  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    this.ensureAuthenticated();

    try {
      const apiNoteData = this.transformNoteToApiNote(noteData);
      const response = await window.gapi.client.keep.notes.create({
        resource: apiNoteData
      });

      return this.transformApiNoteToNote(response.result);
    } catch (error) {
      throw new Error(`Failed to create note: ${error}`);
    }
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, updates: UpdateNoteRequest): Promise<Note> {
    this.ensureAuthenticated();

    try {
      const apiUpdates = this.transformNoteToApiNote(updates);
      const response = await window.gapi.client.keep.notes.patch({
        noteId: id,
        resource: apiUpdates
      });

      return this.transformApiNoteToNote(response.result);
    } catch (error) {
      throw new Error(`Failed to update note ${id}: ${error}`);
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    this.ensureAuthenticated();

    try {
      await window.gapi.client.keep.notes.delete({
        noteId: id
      });
    } catch (error) {
      throw new Error(`Failed to delete note ${id}: ${error}`);
    }
  }

  /**
   * Ensure user is authenticated, throw error if not
   */
  private ensureAuthenticated(): void {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
  }

  /**
   * Transform Google Keep API note to our Note interface
   */
  private transformApiNoteToNote(apiNote: GoogleApiNote): Note {
    return {
      id: apiNote.id,
      title: apiNote.title || '',
      content: apiNote.content || '',
      color: apiNote.color || '#ffffff',
      labels: apiNote.labels || [],
      isPinned: apiNote.isPinned || false,
      isArchived: apiNote.isArchived || false,
      createdAt: new Date(apiNote.createTime || Date.now()),
      updatedAt: new Date(apiNote.updateTime || Date.now())
    };
  }

  /**
   * Transform our Note interface to Google Keep API format
   */
  private transformNoteToApiNote(note: Partial<Note>): Partial<GoogleApiNote> {
    const apiNote: Partial<GoogleApiNote> = {};

    if (note.title !== undefined) apiNote.title = note.title;
    if (note.content !== undefined) apiNote.content = note.content;
    if (note.color !== undefined) apiNote.color = note.color;
    if (note.labels !== undefined) apiNote.labels = note.labels;
    if (note.isPinned !== undefined) apiNote.isPinned = note.isPinned;
    if (note.isArchived !== undefined) apiNote.isArchived = note.isArchived;

    return apiNote;
  }
}

// Extend window interface for Google API
declare global {
  interface Window {
    gapi: {
      load: (apis: string, callback: () => void) => void;
      client: {
        init: (config: GoogleClientConfig) => Promise<void>;
        keep: {
          notes: GoogleKeepNotesApi;
        };
      };
      auth2: {
        init: (config: GoogleAuthConfig) => Promise<GoogleAuthInstance>;
        getAuthInstance: () => GoogleAuthInstance;
      };
    };
  }
}
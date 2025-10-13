/**
 * Note type representing a Google Keep note
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  labels: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Partial note type for creating/updating notes
 */
export type CreateNoteRequest = Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Note update request type
 */
export type UpdateNoteRequest = Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>;
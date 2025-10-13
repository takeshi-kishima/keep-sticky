/**
 * Position type for sticky note positioning
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size type for sticky note dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Sticky note type for independent window display
 */
export interface StickyNote {
  id: string;
  noteId: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  zIndex: number;
}

/**
 * Sticky note update request type
 */
export type UpdateStickyRequest = Partial<Omit<StickyNote, 'id' | 'noteId'>>;
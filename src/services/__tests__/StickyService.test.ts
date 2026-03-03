import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase modules before importing anything
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockGetDocs = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
}));

import {
  createSticky,
  updateStickyPosition,
  updateStickySize,
  closeSticky,
  bringToFront,
  deleteStickiesForNote,
} from '../StickyService';

describe('StickyService (Firestore)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockReturnValue('stickies-col-ref');
    mockDoc.mockReturnValue('doc-ref');
    mockQuery.mockReturnValue('query-ref');
    mockWhere.mockReturnValue('where-clause');
  });

  describe('createSticky', () => {
    it('should create a sticky with default values', async () => {
      mockAddDoc.mockResolvedValue({ id: 'sticky-1' });

      const id = await createSticky('uid-1', 'note-1');

      expect(id).toBe('sticky-1');
      expect(mockAddDoc).toHaveBeenCalledWith('stickies-col-ref', expect.objectContaining({
        noteId: 'note-1',
        position: { x: 100, y: 100 },
        size: { width: 250, height: 300 },
        isMinimized: false,
      }));
    });

    it('should create a sticky with custom position and size', async () => {
      mockAddDoc.mockResolvedValue({ id: 'sticky-2' });

      const id = await createSticky('uid-1', 'note-2', { x: 200, y: 150 }, { width: 400, height: 500 });

      expect(id).toBe('sticky-2');
      expect(mockAddDoc).toHaveBeenCalledWith('stickies-col-ref', expect.objectContaining({
        noteId: 'note-2',
        position: { x: 200, y: 150 },
        size: { width: 400, height: 500 },
      }));
    });

    it('should use Date.now() for zIndex', async () => {
      mockAddDoc.mockResolvedValue({ id: 'sticky-3' });
      const before = Date.now();

      await createSticky('uid-1', 'note-3');

      const call = mockAddDoc.mock.calls[0][1];
      expect(call.zIndex).toBeGreaterThanOrEqual(before);
      expect(call.zIndex).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('updateStickyPosition', () => {
    it('should update position via Firestore', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateStickyPosition('uid-1', 'sticky-1', { x: 300, y: 250 });

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        position: { x: 300, y: 250 },
      });
    });
  });

  describe('updateStickySize', () => {
    it('should update size via Firestore', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateStickySize('uid-1', 'sticky-1', { width: 400, height: 500 });

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        size: { width: 400, height: 500 },
      });
    });

    it('should enforce minimum size constraints', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateStickySize('uid-1', 'sticky-1', { width: 50, height: 50 });

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        size: { width: 200, height: 150 },
      });
    });
  });

  describe('closeSticky', () => {
    it('should delete sticky from Firestore', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await closeSticky('uid-1', 'sticky-1');

      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
    });
  });

  describe('bringToFront', () => {
    it('should update zIndex to Date.now()', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      const before = Date.now();

      await bringToFront('uid-1', 'sticky-1');

      const call = mockUpdateDoc.mock.calls[0][1];
      expect(call.zIndex).toBeGreaterThanOrEqual(before);
    });
  });

  describe('deleteStickiesForNote', () => {
    it('should delete all stickies for a given noteId', async () => {
      const mockRef1 = { ref: 'ref-1' };
      const mockRef2 = { ref: 'ref-2' };
      mockGetDocs.mockResolvedValue({ docs: [mockRef1, mockRef2] });
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteStickiesForNote('uid-1', 'note-1');

      expect(mockDeleteDoc).toHaveBeenCalledTimes(2);
      expect(mockDeleteDoc).toHaveBeenCalledWith('ref-1');
      expect(mockDeleteDoc).toHaveBeenCalledWith('ref-2');
    });

    it('should handle case with no stickies', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      await deleteStickiesForNote('uid-1', 'note-1');

      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });
  });
});

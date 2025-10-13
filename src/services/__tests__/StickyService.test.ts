import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StickyService } from '../StickyService';
import type { StickyNote, Position, Size } from '../../types';

describe('StickyService', () => {
  let stickyService: StickyService;

  beforeEach(() => {
    // localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);
    
    stickyService = new StickyService();
  });

  describe('createSticky', () => {
    it('should create a new sticky note with default values', async () => {
      const noteId = 'note-123';
      const sticky = await stickyService.createSticky(noteId);

      expect(sticky.id).toBeDefined();
      expect(sticky.noteId).toBe(noteId);
      expect(sticky.position).toEqual({ x: 100, y: 100 });
      expect(sticky.size).toEqual({ width: 250, height: 300 });
      expect(sticky.isMinimized).toBe(false);
      expect(sticky.zIndex).toBeGreaterThan(0);
    });

    it('should create sticky with custom position and size', async () => {
      const noteId = 'note-456';
      const position: Position = { x: 200, y: 150 };
      const size: Size = { width: 300, height: 400 };

      const sticky = await stickyService.createSticky(noteId, position, size);

      expect(sticky.position).toEqual(position);
      expect(sticky.size).toEqual(size);
      expect(sticky.noteId).toBe(noteId);
    });

    it('should increment z-index for multiple stickies', async () => {
      const sticky1 = await stickyService.createSticky('note-1');
      const sticky2 = await stickyService.createSticky('note-2');

      expect(sticky2.zIndex).toBeGreaterThan(sticky1.zIndex);
    });
  });

  describe('updateStickyPosition', () => {
    it('should update sticky position', async () => {
      const sticky = await stickyService.createSticky('note-123');
      const newPosition: Position = { x: 300, y: 250 };

      await stickyService.updateStickyPosition(sticky.id, newPosition);
      const stickies = stickyService.getAllStickies();
      const updatedSticky = stickies.find((s: StickyNote) => s.id === sticky.id);

      expect(updatedSticky?.position).toEqual(newPosition);
    });

    it('should throw error for non-existent sticky', async () => {
      const position: Position = { x: 100, y: 100 };

      await expect(
        stickyService.updateStickyPosition('non-existent', position)
      ).rejects.toThrow('Sticky note not found');
    });
  });

  describe('updateStickySize', () => {
    it('should update sticky size', async () => {
      const sticky = await stickyService.createSticky('note-123');
      const newSize: Size = { width: 400, height: 500 };

      await stickyService.updateStickySize(sticky.id, newSize);
      const stickies = stickyService.getAllStickies();
      const updatedSticky = stickies.find((s: StickyNote) => s.id === sticky.id);

      expect(updatedSticky?.size).toEqual(newSize);
    });

    it('should enforce minimum size constraints', async () => {
      const sticky = await stickyService.createSticky('note-123');
      const tooSmallSize: Size = { width: 50, height: 50 };

      await stickyService.updateStickySize(sticky.id, tooSmallSize);
      const stickies = stickyService.getAllStickies();
      const updatedSticky = stickies.find((s: StickyNote) => s.id === sticky.id);

      expect(updatedSticky?.size.width).toBeGreaterThanOrEqual(200);
      expect(updatedSticky?.size.height).toBeGreaterThanOrEqual(150);
    });
  });

  describe('closeSticky', () => {
    it('should remove sticky note', async () => {
      const sticky = await stickyService.createSticky('note-123');
      
      await stickyService.closeSticky(sticky.id);
      const stickies = stickyService.getAllStickies();

      expect(stickies.find((s: StickyNote) => s.id === sticky.id)).toBeUndefined();
    });

    it('should not throw error for non-existent sticky', async () => {
      await expect(
        stickyService.closeSticky('non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('State persistence', () => {
    it('should save stickies to localStorage', async () => {
      const sticky = await stickyService.createSticky('note-123');
      
      await stickyService.saveStickiesState();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'keep-sticky-notes',
        expect.stringContaining(sticky.id)
      );
    });

    it('should load stickies from localStorage', async () => {
      const mockStickies: StickyNote[] = [{
        id: 'sticky-1',
        noteId: 'note-1',
        position: { x: 100, y: 100 },
        size: { width: 250, height: 300 },
        isMinimized: false,
        zIndex: 1000
      }];

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockStickies));

      const loadedStickies = await stickyService.loadStickiesState();

      expect(loadedStickies).toEqual(mockStickies);
    });

    it('should return empty array when no saved state', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const stickies = await stickyService.loadStickiesState();

      expect(stickies).toEqual([]);
    });
  });
});
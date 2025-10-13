import { describe, it, expect } from 'vitest';
import type { 
  User, 
  AuthContextType, 
  Note, 
  CreateNoteRequest, 
  UpdateNoteRequest,
  StickyNote,
  Position,
  Size,
  UpdateStickyRequest 
} from '../index';

describe('Type Definitions', () => {
  describe('User Types', () => {
    it('should create valid User object', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      };

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.picture).toBe('https://example.com/avatar.jpg');
    });

    it('should create valid AuthContextType object', () => {
      const mockLogin = async () => {};
      const mockLogout = async () => {};

      const authContext: AuthContextType = {
        user: null,
        isAuthenticated: false,
        login: mockLogin,
        logout: mockLogout
      };

      expect(authContext.user).toBeNull();
      expect(authContext.isAuthenticated).toBe(false);
      expect(typeof authContext.login).toBe('function');
      expect(typeof authContext.logout).toBe('function');
    });
  });

  describe('Note Types', () => {
    it('should create valid Note object', () => {
      const now = new Date();
      const note: Note = {
        id: 'note-123',
        title: 'Test Note',
        content: 'This is a test note content',
        color: '#ffeb3b',
        labels: ['test', 'example'],
        isPinned: false,
        isArchived: false,
        createdAt: now,
        updatedAt: now
      };

      expect(note.id).toBe('note-123');
      expect(note.title).toBe('Test Note');
      expect(note.content).toBe('This is a test note content');
      expect(note.color).toBe('#ffeb3b');
      expect(note.labels).toEqual(['test', 'example']);
      expect(note.isPinned).toBe(false);
      expect(note.isArchived).toBe(false);
      expect(note.createdAt).toBe(now);
      expect(note.updatedAt).toBe(now);
    });

    it('should create valid CreateNoteRequest object', () => {
      const createRequest: CreateNoteRequest = {
        title: 'New Note',
        content: 'New note content',
        color: '#ff9800'
      };

      expect(createRequest.title).toBe('New Note');
      expect(createRequest.content).toBe('New note content');
      expect(createRequest.color).toBe('#ff9800');
    });

    it('should create valid UpdateNoteRequest object', () => {
      const updateRequest: UpdateNoteRequest = {
        title: 'Updated Title',
        isPinned: true
      };

      expect(updateRequest.title).toBe('Updated Title');
      expect(updateRequest.isPinned).toBe(true);
    });
  });

  describe('StickyNote Types', () => {
    it('should create valid Position object', () => {
      const position: Position = {
        x: 100,
        y: 200
      };

      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should create valid Size object', () => {
      const size: Size = {
        width: 300,
        height: 400
      };

      expect(size.width).toBe(300);
      expect(size.height).toBe(400);
    });

    it('should create valid StickyNote object', () => {
      const stickyNote: StickyNote = {
        id: 'sticky-123',
        noteId: 'note-456',
        position: { x: 50, y: 100 },
        size: { width: 250, height: 300 },
        isMinimized: false,
        zIndex: 1000
      };

      expect(stickyNote.id).toBe('sticky-123');
      expect(stickyNote.noteId).toBe('note-456');
      expect(stickyNote.position).toEqual({ x: 50, y: 100 });
      expect(stickyNote.size).toEqual({ width: 250, height: 300 });
      expect(stickyNote.isMinimized).toBe(false);
      expect(stickyNote.zIndex).toBe(1000);
    });

    it('should create valid UpdateStickyRequest object', () => {
      const updateRequest: UpdateStickyRequest = {
        position: { x: 200, y: 300 },
        isMinimized: true
      };

      expect(updateRequest.position).toEqual({ x: 200, y: 300 });
      expect(updateRequest.isMinimized).toBe(true);
    });
  });
});
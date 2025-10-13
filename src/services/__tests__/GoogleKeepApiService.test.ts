import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleKeepApiService } from '../GoogleKeepApiService';
import type { Note } from '../../types';

// Google APIs mock
const mockGapi = {
  load: vi.fn(),
  auth2: {
    getAuthInstance: vi.fn(),
    init: vi.fn()
  },
  client: {
    init: vi.fn(),
    keep: {
      notes: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
      }
    }
  }
};

vi.stubGlobal('gapi', mockGapi);

describe('GoogleKeepApiService', () => {
  let apiService: GoogleKeepApiService;
  let mockAuthInstance: {
    signIn: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    isSignedIn: { get: ReturnType<typeof vi.fn> };
    currentUser: { get: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    mockAuthInstance = {
      signIn: vi.fn(),
      signOut: vi.fn(),
      isSignedIn: {
        get: vi.fn()
      },
      currentUser: {
        get: vi.fn()
      }
    };

    mockGapi.auth2.getAuthInstance.mockReturnValue(mockAuthInstance);
    
    apiService = new GoogleKeepApiService({
      clientId: 'test-client-id',
      discoveryDoc: 'test-discovery-doc',
      scope: 'https://www.googleapis.com/auth/keep'
    });
  });

  describe('Authentication', () => {
    it('should initialize Google API client', async () => {
      mockGapi.load.mockImplementation((_apis, callback) => callback());
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGapi.auth2.init.mockResolvedValue(mockAuthInstance);

      await apiService.initialize();

      expect(mockGapi.load).toHaveBeenCalledWith('client:auth2', expect.any(Function));
      expect(mockGapi.client.init).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        discoveryDoc: 'test-discovery-doc',
        scope: 'https://www.googleapis.com/auth/keep'
      });
    });

    it('should authenticate user successfully', async () => {
      // Set up mocks for initialization
      mockGapi.load.mockImplementation((_apis, callback) => callback());
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGapi.auth2.init.mockResolvedValue(mockAuthInstance);

      const mockUser = {
        getBasicProfile: () => ({
          getId: () => 'user-123',
          getEmail: () => 'test@example.com',
          getName: () => 'Test User',
          getImageUrl: () => 'https://example.com/avatar.jpg'
        })
      };

      mockAuthInstance.signIn.mockResolvedValue(undefined);
      mockAuthInstance.currentUser.get.mockReturnValue(mockUser);
      mockAuthInstance.isSignedIn.get.mockReturnValue(true);

      const user = await apiService.authenticate();

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      });
    });

    it('should throw error if authentication fails', async () => {
      // Set up mocks for initialization
      mockGapi.load.mockImplementation((_apis, callback) => callback());
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGapi.auth2.init.mockResolvedValue(mockAuthInstance);

      mockAuthInstance.signIn.mockRejectedValue(new Error('Sign-in failed'));

      await expect(apiService.authenticate()).rejects.toThrow('Authentication failed');
    });

    it('should check if user is authenticated', async () => {
      // Initialize first
      mockGapi.load.mockImplementation((_apis, callback) => callback());
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGapi.auth2.init.mockResolvedValue(mockAuthInstance);
      await apiService.initialize();

      mockAuthInstance.isSignedIn.get.mockReturnValue(true);

      const isAuthenticated = apiService.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('should sign out user', async () => {
      // Initialize first
      mockGapi.load.mockImplementation((_apis, callback) => callback());
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGapi.auth2.init.mockResolvedValue(mockAuthInstance);
      await apiService.initialize();

      mockAuthInstance.signOut.mockResolvedValue(undefined);

      await apiService.signOut();

      expect(mockAuthInstance.signOut).toHaveBeenCalled();
    });
  });

  describe('Notes API', () => {
    const mockNote: Note = {
      id: 'note-123',
      title: 'Test Note',
      content: 'Test content',
      color: '#ffeb3b',
      labels: ['test'],
      isPinned: false,
      isArchived: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    };

    beforeEach(async () => {
      // Initialize the service first
      mockGapi.load.mockImplementation((_apis, callback) => callback());
      mockGapi.client.init.mockResolvedValue(undefined);
      mockGapi.auth2.init.mockResolvedValue(mockAuthInstance);
      await apiService.initialize();
      
      // Set authenticated state
      mockAuthInstance.isSignedIn.get.mockReturnValue(true);
    });

    it('should fetch notes list', async () => {
      const mockApiResponse = {
        result: {
          notes: [{
            id: 'note-123',
            title: 'Test Note',
            content: 'Test content',
            color: '#ffeb3b',
            labels: ['test'],
            isPinned: false,
            isArchived: false,
            createTime: '2025-01-01T00:00:00Z',
            updateTime: '2025-01-01T00:00:00Z'
          }]
        }
      };

      mockGapi.client.keep.notes.list.mockResolvedValue(mockApiResponse);

      const notes = await apiService.fetchNotes();

      expect(notes).toHaveLength(1);
      expect(notes[0]).toMatchObject({
        id: 'note-123',
        title: 'Test Note',
        content: 'Test content'
      });
    });

    it('should fetch individual note', async () => {
      const mockApiResponse = {
        result: {
          id: 'note-123',
          title: 'Test Note',
          content: 'Test content',
          color: '#ffeb3b',
          labels: ['test'],
          isPinned: false,
          isArchived: false,
          createTime: '2025-01-01T00:00:00Z',
          updateTime: '2025-01-01T00:00:00Z'
        }
      };

      mockGapi.client.keep.notes.get.mockResolvedValue(mockApiResponse);

      const note = await apiService.fetchNote('note-123');

      expect(note.id).toBe('note-123');
      expect(note.title).toBe('Test Note');
    });

    it('should create new note', async () => {
      const newNote = {
        title: 'New Note',
        content: 'New content',
        color: '#ff9800'
      };

      const mockApiResponse = {
        result: {
          id: 'note-456',
          title: 'New Note',
          content: 'New content',
          color: '#ff9800',
          labels: [],
          isPinned: false,
          isArchived: false,
          createTime: '2025-01-01T00:00:00Z',
          updateTime: '2025-01-01T00:00:00Z'
        }
      };

      mockGapi.client.keep.notes.create.mockResolvedValue(mockApiResponse);

      const createdNote = await apiService.createNote(newNote);

      expect(createdNote.id).toBe('note-456');
      expect(createdNote.title).toBe('New Note');
    });

    it('should update existing note', async () => {
      const updates = {
        title: 'Updated Title',
        isPinned: true
      };

      const mockApiResponse = {
        result: {
          ...mockNote,
          title: 'Updated Title',
          isPinned: true
        }
      };

      mockGapi.client.keep.notes.patch.mockResolvedValue(mockApiResponse);

      const updatedNote = await apiService.updateNote('note-123', updates);

      expect(updatedNote.title).toBe('Updated Title');
      expect(updatedNote.isPinned).toBe(true);
    });

    it('should delete note', async () => {
      mockGapi.client.keep.notes.delete.mockResolvedValue({ result: {} });

      await expect(apiService.deleteNote('note-123')).resolves.not.toThrow();

      expect(mockGapi.client.keep.notes.delete).toHaveBeenCalledWith({
        noteId: 'note-123'
      });
    });

    it('should throw error when not authenticated', async () => {
      mockAuthInstance.isSignedIn.get.mockReturnValue(false);

      await expect(apiService.fetchNotes()).rejects.toThrow('User not authenticated');
    });
  });
});
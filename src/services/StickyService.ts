import type { StickyNote, Position, Size } from '../types';

/**
 * Service for managing sticky notes display and persistence
 */
export class StickyService {
  private stickies: StickyNote[] = [];
  private nextZIndex = 1000;
  private readonly STORAGE_KEY = 'keep-sticky-notes';

  /**
   * Create a new sticky note
   */
  async createSticky(
    noteId: string, 
    position: Position = { x: 100, y: 100 },
    size: Size = { width: 250, height: 300 }
  ): Promise<StickyNote> {
    const sticky: StickyNote = {
      id: `sticky-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      noteId,
      position,
      size,
      isMinimized: false,
      zIndex: this.nextZIndex++
    };

    this.stickies.push(sticky);
    await this.saveStickiesState();
    
    return sticky;
  }

  /**
   * Update sticky note position
   */
  async updateStickyPosition(id: string, position: Position): Promise<void> {
    const sticky = this.stickies.find(s => s.id === id);
    if (!sticky) {
      throw new Error('Sticky note not found');
    }

    sticky.position = position;
    await this.saveStickiesState();
  }

  /**
   * Update sticky note size with minimum constraints
   */
  async updateStickySize(id: string, size: Size): Promise<void> {
    const sticky = this.stickies.find(s => s.id === id);
    if (!sticky) {
      throw new Error('Sticky note not found');
    }

    // Enforce minimum size constraints
    const minWidth = 200;
    const minHeight = 150;

    sticky.size = {
      width: Math.max(size.width, minWidth),
      height: Math.max(size.height, minHeight)
    };

    await this.saveStickiesState();
  }

  /**
   * Close (remove) a sticky note
   */
  async closeSticky(id: string): Promise<void> {
    const index = this.stickies.findIndex(s => s.id === id);
    if (index !== -1) {
      this.stickies.splice(index, 1);
      await this.saveStickiesState();
    }
    // Don't throw error if sticky doesn't exist - it's already "closed"
  }

  /**
   * Toggle sticky minimized state
   */
  async toggleStickyMinimized(id: string): Promise<void> {
    const sticky = this.stickies.find(s => s.id === id);
    if (!sticky) {
      throw new Error('Sticky note not found');
    }

    sticky.isMinimized = !sticky.isMinimized;
    await this.saveStickiesState();
  }

  /**
   * Bring sticky to front (update z-index)
   */
  async bringToFront(id: string): Promise<void> {
    const sticky = this.stickies.find(s => s.id === id);
    if (!sticky) {
      throw new Error('Sticky note not found');
    }

    sticky.zIndex = this.nextZIndex++;
    await this.saveStickiesState();
  }

  /**
   * Save stickies state to localStorage
   */
  async saveStickiesState(): Promise<void> {
    try {
      const stateJson = JSON.stringify(this.stickies);
      localStorage.setItem(this.STORAGE_KEY, stateJson);
    } catch (error) {
      console.error('Failed to save stickies state:', error);
      throw new Error('Failed to save stickies state');
    }
  }

  /**
   * Load stickies state from localStorage
   */
  async loadStickiesState(): Promise<StickyNote[]> {
    try {
      const stateJson = localStorage.getItem(this.STORAGE_KEY);
      if (!stateJson) {
        return [];
      }

      const loadedStickies = JSON.parse(stateJson) as StickyNote[];
      this.stickies = loadedStickies;
      
      // Update nextZIndex to avoid conflicts
      if (loadedStickies.length > 0) {
        const maxZIndex = Math.max(...loadedStickies.map(s => s.zIndex));
        this.nextZIndex = maxZIndex + 1;
      }

      return this.stickies;
    } catch (error) {
      console.error('Failed to load stickies state:', error);
      return [];
    }
  }

  /**
   * Get all current stickies
   */
  getAllStickies(): StickyNote[] {
    return [...this.stickies];
  }

  /**
   * Get sticky by ID
   */
  getStickyById(id: string): StickyNote | undefined {
    return this.stickies.find(s => s.id === id);
  }

  /**
   * Clear all stickies
   */
  async clearAllStickies(): Promise<void> {
    this.stickies = [];
    await this.saveStickiesState();
  }
}
import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth';
import {
  subscribeToStickies,
  createSticky,
  updateStickyPosition,
  updateStickySize,
  closeSticky,
  toggleStickyMinimized,
  bringToFront,
} from '../services/StickyService';
import type { StickyNote, Position, Size } from '../types';

export function useStickies() {
  const { user } = useAuth();
  const [stickies, setStickies] = useState<StickyNote[]>([]);

  useEffect(() => {
    if (!user) {
      setStickies([]);
      return;
    }

    const unsubscribe = subscribeToStickies(user.id, (updated) => {
      setStickies(updated);
    });

    return () => unsubscribe();
  }, [user]);

  const addSticky = async (noteId: string, position?: Position, size?: Size): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return createSticky(user.id, noteId, position, size);
  };

  const moveSticky = async (id: string, position: Position): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return updateStickyPosition(user.id, id, position);
  };

  const resizeSticky = async (id: string, size: Size): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return updateStickySize(user.id, id, size);
  };

  const removeSticky = async (id: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return closeSticky(user.id, id);
  };

  const toggleMinimized = async (id: string, current: boolean): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return toggleStickyMinimized(user.id, id, current);
  };

  const bringStickyToFront = async (id: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    return bringToFront(user.id, id);
  };

  return { stickies, addSticky, moveSticky, resizeSticky, removeSticky, toggleMinimized, bringStickyToFront };
}

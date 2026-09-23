import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { getAdventureSpellCount } from '@/constants/levels';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider>{children}</GameProvider>
);

describe('reverse-wizard adventure id', () => {
  it('resolves to its real 4-level spell count', () => {
    expect(getAdventureSpellCount('reverse-wizard')).toBe(4);
  });

  it('documents that the old "reverse" id silently falls back to Classic\'s count', () => {
    // constants/adventures.ts no longer uses this id (fixed to 'reverse-wizard'),
    // but getAdventureSpellCount falls back to LEVELS.length for any unknown id —
    // this is why the mismatch used to be silent instead of erroring.
    expect(getAdventureSpellCount('reverse')).toBe(12);
  });
});

describe('useGame().getLevelStatus', () => {
  it('reflects locked/current/completed as Classic levels are won', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });

    expect(result.current.getLevelStatus(1)).toBe('current');
    expect(result.current.getLevelStatus(2)).toBe('locked');

    await act(() => {
      result.current.completeLevel();
    });

    expect(result.current.getLevelStatus(1)).toBe('completed');
    expect(result.current.getLevelStatus(2)).toBe('current');
    expect(result.current.getLevelStatus(3)).toBe('locked');
    expect(result.current.gameState.xpTotal).toBeGreaterThan(0);
  });
});

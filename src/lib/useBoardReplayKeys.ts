import { useCallback, type KeyboardEvent } from 'react';

const replaySteps: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -2,
  ArrowDown: 2,
};

export function useBoardReplayKeys(onStep?: (offset: number) => void) {
  return useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const step = replaySteps[event.key];
    if (!onStep || step === undefined) return;
    event.preventDefault();
    onStep(step);
  }, [onStep]);
}

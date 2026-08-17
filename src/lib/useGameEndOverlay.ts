import { useEffect, useState } from 'react';

export function useGameEndOverlay(isGameOver: boolean) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isGameOver) setIsOpen(true);
  }, [isGameOver]);

  return { isOpen, closeOverlay: () => setIsOpen(false) };
}

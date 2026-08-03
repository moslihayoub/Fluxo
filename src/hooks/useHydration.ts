'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Sync with Zustand persist state
    const unsubscribe = useStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(useStore.persist.hasHydrated());

    return () => {
      unsubscribe();
    };
  }, []);

  return hydrated;
}

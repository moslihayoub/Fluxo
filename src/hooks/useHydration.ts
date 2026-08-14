'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    const unsubscribe = useStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return hydrated;
}

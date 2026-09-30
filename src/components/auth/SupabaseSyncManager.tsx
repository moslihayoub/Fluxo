'use client';

import { useEffect } from 'react';
import { supabase, fromSupabaseMaterial, toSupabaseMaterial } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { BusinessMaterial } from '@/types';

export default function SupabaseSyncManager({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let isMounted = true;

    // 1. Initial fetch & local synchronization
    const syncInitialMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from('business_materials')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase initial fetch error:', error);
          return;
        }

        if (isMounted) {
          const remoteMaterials: BusinessMaterial[] = (data || []).map(fromSupabaseMaterial);
          const localMaterials = useStore.getState().businessMaterials || [];

          // If remote has data, update store
          if (remoteMaterials.length > 0) {
            // Merge remote with local to avoid losing any local items
            const remoteMap = new Map(remoteMaterials.map(m => [m.id, m]));
            // Add local ones that are not in remote yet
            const missingInRemote = localMaterials.filter(m => !remoteMap.has(m.id));
            if (missingInRemote.length > 0) {
              const rowsToInsert = missingInRemote.map(toSupabaseMaterial);
              await supabase.from('business_materials').upsert(rowsToInsert);
            }
            useStore.setState({ businessMaterials: [...remoteMaterials, ...missingInRemote] });
          } else if (localMaterials.length > 0) {
            // Upload initial local cache to Supabase
            const rowsToInsert = localMaterials.map(toSupabaseMaterial);
            await supabase.from('business_materials').upsert(rowsToInsert);
          }
        }
      } catch (err) {
        console.warn('Error during Supabase initial synchronization:', err);
      }
    };

    syncInitialMaterials();

    // 2. Realtime subscription for cross-device / multi-tab live sync
    const channel = supabase
      .channel('realtime:business_materials')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'business_materials' },
        (payload) => {
          if (!isMounted) return;

          if (payload.eventType === 'INSERT') {
            const newMat = fromSupabaseMaterial(payload.new);
            useStore.setState((state) => {
              if (state.businessMaterials.some((m) => m.id === newMat.id)) {
                return state;
              }
              return { businessMaterials: [newMat, ...state.businessMaterials] };
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedMat = fromSupabaseMaterial(payload.new);
            useStore.setState((state) => ({
              businessMaterials: state.businessMaterials.map((m) =>
                m.id === updatedMat.id ? updatedMat : m
              ),
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id;
            if (deletedId) {
              useStore.setState((state) => ({
                businessMaterials: state.businessMaterials.filter((m) => m.id !== deletedId),
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return <>{children}</>;
}

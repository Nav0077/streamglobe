// hooks/useRealtime.ts

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { KeyedMutator } from 'swr';

export function useRealtime(mutate: KeyedMutator<any>) {
  useEffect(() => {
    const channel = supabase
      .channel('streams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
        },
        () => {
          // Revalidate the SWR cache when data changes
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);
}

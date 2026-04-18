import { useState, useEffect, useCallback } from 'react';
import { SyncState } from '@/types';

export function useSync() {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingCount, setPendingCount] = useState(3);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  const triggerSync = useCallback(async () => {
    if (pendingCount === 0) return;
    setSyncState('syncing');
    await new Promise((r) => setTimeout(r, 2500));
    setSyncState('synced');
    setPendingCount(0);
    setLastSynced(new Date());
  }, [pendingCount]);

  useEffect(() => {
    if (pendingCount > 0) {
      setSyncState('offline');
    }
  }, [pendingCount]);

  const addPending = useCallback(() => {
    setPendingCount((p) => p + 1);
    setSyncState('offline');
  }, []);

  return { syncState, pendingCount, lastSynced, triggerSync, addPending };
}

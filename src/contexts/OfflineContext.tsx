import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSyncMeta,
  getSyncQueue,
  removeSyncQueueItem,
  SyncMeta,
  SyncQueueItem,
} from '@/offline/offlineDb';
import { prepareForField as runPrepareForField, syncOfflineQueue } from '@/offline/offlineSync';
import { useToast } from '@/hooks/use-toast';
import { useSafeQueryClient } from '@/hooks/useSafeQueryClient';

interface OfflineContextValue {
  isOnline: boolean;
  pendingQueue: SyncQueueItem[];
  pendingCount: number;
  syncMeta: SyncMeta;
  isPreparing: boolean;
  isSyncing: boolean;
  prepareForField: () => Promise<void>;
  syncNow: (silent?: boolean) => Promise<void>;
  removeQueueItem: (id: string) => Promise<void>;
  refreshQueue: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue>({
  isOnline: true,
  pendingQueue: [],
  pendingCount: 0,
  syncMeta: { lastSyncedAt: null },
  isPreparing: false,
  isSyncing: false,
  prepareForField: async () => {},
  syncNow: async () => {},
  removeQueueItem: async () => {},
  refreshQueue: async () => {},
});

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useSafeQueryClient();

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingQueue, setPendingQueue] = useState<SyncQueueItem[]>([]);
  const [syncMeta, setSyncMeta] = useState<SyncMeta>({ lastSyncedAt: null });
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshQueue = useCallback(async () => {
    const [queue, meta] = await Promise.all([getSyncQueue(), getSyncMeta()]);
    setPendingQueue(queue);
    setSyncMeta(meta);
  }, []);

  const syncNow = useCallback(
    async (silent = false) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (!silent) {
          toast({
            title: 'Sem conexão com a internet',
            description: 'Seus registros continuam salvos com segurança no dispositivo.',
            variant: 'destructive',
          });
        }
        return;
      }

      setIsSyncing(true);
      try {
        const result = await syncOfflineQueue();
        await refreshQueue();

        if (result.syncedCount > 0) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['clients'] }),
            queryClient.invalidateQueries({ queryKey: ['farms'] }),
            queryClient.invalidateQueries({ queryKey: ['orders'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
          ]);
          window.dispatchEvent(new CustomEvent('farmflow-offline-synced'));

          toast({
            title: 'Sincronização concluída!',
            description:
              result.failedCount > 0
                ? `${result.syncedCount} registro(s) enviado(s) e ${result.failedCount} com erro para revisão.`
                : `${result.syncedCount} registro(s) criado(s) em campo enviado(s) ao servidor.`,
          });
        } else if (!silent && result.failedCount > 0) {
          toast({
            title: 'Alguns registros precisam de revisão',
            description: `${result.failedCount} item(ns) não puderam ser enviados. Abra a Central de Sincronização.`,
            variant: 'destructive',
          });
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [queryClient, refreshQueue, toast]
  );

  const prepareForField = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast({
        title: 'Você está offline',
        description: 'Conecte-se à internet antes de baixar os dados para ir a campo.',
        variant: 'destructive',
      });
      return;
    }

    setIsPreparing(true);
    try {
      const meta = await runPrepareForField();
      setSyncMeta(meta);
      toast({
        title: 'Pronto para ir a campo!',
        description: `Dados salvos offline: ${meta.counts?.clients || 0} clientes, ${meta.counts?.farms || 0} fazendas e ${meta.counts?.costVariables || 0} variáveis de preço.`,
      });
    } catch (err: any) {
      toast({
        title: 'Erro ao preparar dados offline',
        description: err?.message || 'Tente novamente com conexão estável.',
        variant: 'destructive',
      });
    } finally {
      setIsPreparing(false);
    }
  }, [toast]);

  const removeQueueItem = useCallback(
    async (id: string) => {
      await removeSyncQueueItem(id);
      await refreshQueue();
    },
    [refreshQueue]
  );

  useEffect(() => {
    refreshQueue();

    const handleOnline = () => {
      setIsOnline(true);
      syncNow(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Modo Campo Offline ativado',
        description: 'Sem internet. Você pode continuar criando clientes, fazendas, talhões e pedidos normalmente.',
      });
    };
    const handleQueueChanged = () => {
      refreshQueue();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('farmflow-offline-queue-changed', handleQueueChanged);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('farmflow-offline-queue-changed', handleQueueChanged);
    };
  }, [refreshQueue, syncNow, toast]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingQueue,
        pendingCount: pendingQueue.length,
        syncMeta,
        isPreparing,
        isSyncing,
        prepareForField,
        syncNow,
        removeQueueItem,
        refreshQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);

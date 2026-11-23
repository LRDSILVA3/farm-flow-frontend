import { generateUUID } from '@/lib/utils';

const DB_NAME = 'farmflow_offline_db';
const DB_VERSION = 1;

export type OfflineStoreName =
  | 'clients'
  | 'farms'
  | 'orders'
  | 'cost_variables'
  | 'services'
  | 'service_groups'
  | 'products';

export type OfflineOpType =
  | 'CREATE_CLIENT'
  | 'CREATE_FARM'
  | 'CREATE_PLOT'
  | 'CREATE_ORDER';

export interface SyncQueueItem {
  id: string;
  type: OfflineOpType;
  tempId: string;
  parentTempId?: string;
  label: string;
  payload: Record<string, any>;
  createdAt: string;
  status: 'pending' | 'syncing' | 'error';
  errorMessage?: string;
}

export interface SyncMeta {
  lastSyncedAt: string | null;
  counts?: {
    clients: number;
    farms: number;
    orders: number;
    costVariables: number;
    services: number;
    products: number;
  };
}

const SNAPSHOT_STORE = 'snapshots';
const QUEUE_STORE = 'sync_queue';
const META_STORE = 'meta';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB indisponível neste navegador'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE);
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });

  return dbPromise;
};

export const isNetworkError = (err: any): boolean => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (!err) return false;
  if (err.name === 'TypeError' && /fetch|network|load failed/i.test(String(err.message || ''))) {
    return true;
  }
  if (/failed to fetch|networkerror|err_internet_disconnected|network request failed/i.test(String(err.message || ''))) {
    return true;
  }
  return false;
};

export const saveSnapshot = async <T = any>(name: OfflineStoreName, items: T[]): Promise<void> => {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SNAPSHOT_STORE, 'readwrite');
      tx.objectStore(SNAPSHOT_STORE).put(items, name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback silencioso para localStorage em caso de restrição de IndexedDB
    try {
      localStorage.setItem(`@FarmFlow:offline:${name}`, JSON.stringify(items));
    } catch {}
  }
};

export const getSnapshot = async <T = any>(name: OfflineStoreName): Promise<T[]> => {
  try {
    const db = await openDB();
    const data = await new Promise<T[] | undefined>((resolve, reject) => {
      const tx = db.transaction(SNAPSHOT_STORE, 'readonly');
      const req = tx.objectStore(SNAPSHOT_STORE).get(name);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (Array.isArray(data)) return data;
  } catch {}

  try {
    const raw = localStorage.getItem(`@FarmFlow:offline:${name}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const db = await openDB();
    const items = await new Promise<SyncQueueItem[]>((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const req = tx.objectStore(QUEUE_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    try {
      const raw = localStorage.getItem('@FarmFlow:offline:sync_queue');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};

export const enqueueOfflineOp = async (
  op: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status'>
): Promise<SyncQueueItem> => {
  const item: SyncQueueItem = {
    ...op,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      tx.objectStore(QUEUE_STORE).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const current = await getSyncQueue();
    localStorage.setItem('@FarmFlow:offline:sync_queue', JSON.stringify([...current, item]));
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('farmflow-offline-queue-changed'));
  }
  return item;
};

export const updateSyncQueueItem = async (
  id: string,
  patch: Partial<SyncQueueItem>
): Promise<void> => {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          store.put({ ...getReq.result, ...patch });
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const current = await getSyncQueue();
    const next = current.map((i) => (i.id === id ? { ...i, ...patch } : i));
    localStorage.setItem('@FarmFlow:offline:sync_queue', JSON.stringify(next));
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('farmflow-offline-queue-changed'));
  }
};

export const removeSyncQueueItem = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      tx.objectStore(QUEUE_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const current = await getSyncQueue();
    localStorage.setItem(
      '@FarmFlow:offline:sync_queue',
      JSON.stringify(current.filter((i) => i.id !== id))
    );
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('farmflow-offline-queue-changed'));
  }
};

export const saveSyncMeta = async (meta: SyncMeta): Promise<void> => {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readwrite');
      tx.objectStore(META_STORE).put(meta, 'sync_meta');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      localStorage.setItem('@FarmFlow:offline:sync_meta', JSON.stringify(meta));
    } catch {}
  }
};

export const getSyncMeta = async (): Promise<SyncMeta> => {
  try {
    const db = await openDB();
    const meta = await new Promise<SyncMeta | undefined>((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).get('sync_meta');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (meta) return meta;
  } catch {}

  try {
    const raw = localStorage.getItem('@FarmFlow:offline:sync_meta');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lastSyncedAt: null };
};

export const saveTempIdMap = async (map: Record<string, string>): Promise<void> => {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readwrite');
      tx.objectStore(META_STORE).put(map, 'temp_id_map');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
};

export const getTempIdMap = async (): Promise<Record<string, string>> => {
  try {
    const db = await openDB();
    const map = await new Promise<Record<string, string> | undefined>((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).get('temp_id_map');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return map || {};
  } catch {
    return {};
  }
};

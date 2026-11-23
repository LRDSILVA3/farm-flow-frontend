import { api } from '@/services/api';
import {
  getSyncQueue,
  getTempIdMap,
  isNetworkError,
  removeSyncQueueItem,
  saveSnapshot,
  saveSyncMeta,
  saveTempIdMap,
  SyncMeta,
  SyncQueueItem,
  updateSyncQueueItem,
} from './offlineDb';

const OP_PRIORITY: Record<SyncQueueItem['type'], number> = {
  CREATE_CLIENT: 1,
  CREATE_FARM: 2,
  CREATE_PLOT: 3,
  CREATE_ORDER: 4,
};

const replaceTempIdsDeep = (obj: any, idMap: Record<string, string>): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return idMap[obj] || obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceTempIdsDeep(item, idMap));
  }
  if (typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = replaceTempIdsDeep(v, idMap);
    }
    return out;
  }
  return obj;
};

export const prepareForField = async (): Promise<SyncMeta> => {
  const [clients, farms, orders, costVariables, services, serviceGroups, products] = await Promise.all([
    api.get<any[]>('/clients').catch(() => []),
    api.get<any[]>('/farms').catch(() => []),
    api.get<any[]>('/orders').catch(() => []),
    api.get<any[]>('/cost-variables').catch(() => []),
    api.get<any[]>('/services').catch(() => []),
    api.get<any[]>('/service-groups').catch(() => []),
    api.get<any[]>('/products').catch(() => []),
  ]);

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeFarms = Array.isArray(farms) ? farms : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeVars = Array.isArray(costVariables) ? costVariables : [];
  const safeServices = Array.isArray(services) ? services : [];
  const safeGroups = Array.isArray(serviceGroups) ? serviceGroups : [];
  const safeProducts = Array.isArray(products) ? products : [];

  await Promise.all([
    saveSnapshot('clients', safeClients),
    saveSnapshot('farms', safeFarms),
    saveSnapshot('orders', safeOrders),
    saveSnapshot('cost_variables', safeVars),
    saveSnapshot('services', safeServices),
    saveSnapshot('service_groups', safeGroups),
    saveSnapshot('products', safeProducts),
  ]);

  const meta: SyncMeta = {
    lastSyncedAt: new Date().toISOString(),
    counts: {
      clients: safeClients.length,
      farms: safeFarms.length,
      orders: safeOrders.length,
      costVariables: safeVars.length,
      services: safeServices.length,
      products: safeProducts.length,
    },
  };

  await saveSyncMeta(meta);
  return meta;
};

export interface SyncRunResult {
  syncedCount: number;
  failedCount: number;
  stoppedByNetwork: boolean;
}

export const syncOfflineQueue = async (): Promise<SyncRunResult> => {
  const rawQueue = await getSyncQueue();
  if (rawQueue.length === 0) {
    return { syncedCount: 0, failedCount: 0, stoppedByNetwork: false };
  }

  // Ordena respeitando hierarquia: Cliente -> Fazenda -> Talhão -> Pedido, e depois data de criação
  const queue = [...rawQueue].sort((a, b) => {
    const pDiff = OP_PRIORITY[a.type] - OP_PRIORITY[b.type];
    if (pDiff !== 0) return pDiff;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const idMap = await getTempIdMap();
  let syncedCount = 0;
  let failedCount = 0;
  let stoppedByNetwork = false;

  for (const item of queue) {
    // Se depende de um pai temporário que ainda não foi sincronizado, pula por ora
    if (item.parentTempId && item.parentTempId.startsWith('offline-') && !idMap[item.parentTempId]) {
      failedCount++;
      await updateSyncQueueItem(item.id, {
        status: 'error',
        errorMessage: 'Aguardando sincronização do registro pai (cliente/fazenda).',
      });
      continue;
    }

    await updateSyncQueueItem(item.id, { status: 'syncing', errorMessage: undefined });

    try {
      const resolvedPayload = replaceTempIdsDeep(item.payload, idMap);
      let created: any = null;

      if (item.type === 'CREATE_CLIENT') {
        created = await api.post<any>('/clients', resolvedPayload);
      } else if (item.type === 'CREATE_FARM') {
        created = await api.post<any>('/farms', resolvedPayload);
      } else if (item.type === 'CREATE_PLOT') {
        const targetFarmId = idMap[item.parentTempId || ''] || item.parentTempId || resolvedPayload.farm_id;
        created = await api.post<any>(`/farms/${targetFarmId}/plots`, resolvedPayload);
      } else if (item.type === 'CREATE_ORDER') {
        created = await api.post<any>('/orders', resolvedPayload);
      }

      if (created?.id && item.tempId) {
        idMap[item.tempId] = created.id;
        await saveTempIdMap(idMap);
      }

      await removeSyncQueueItem(item.id);
      syncedCount++;
    } catch (err: any) {
      if (isNetworkError(err)) {
        await updateSyncQueueItem(item.id, {
          status: 'pending',
          errorMessage: 'Sem conexão no momento. Será reenviado automaticamente.',
        });
        stoppedByNetwork = true;
        break;
      }

      failedCount++;
      await updateSyncQueueItem(item.id, {
        status: 'error',
        errorMessage: err?.message || 'Erro ao sincronizar com o servidor.',
      });
    }
  }

  // Se sincronizou tudo com sucesso, limpa o mapa de IDs temporários e atualiza os snapshots locais
  const remaining = await getSyncQueue();
  if (remaining.length === 0) {
    await saveTempIdMap({});
    try {
      await prepareForField();
    } catch {}
  }

  return { syncedCount, failedCount, stoppedByNetwork };
};

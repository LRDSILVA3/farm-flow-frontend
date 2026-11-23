import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  WifiOff,
  CloudDownload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Users,
  MapPin,
  Layers,
  FileText,
} from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { OfflineOpType } from '@/offline/offlineDb';

interface OfflineSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OP_LABELS: Record<OfflineOpType, { label: string; icon: React.ElementType; color: string }> = {
  CREATE_CLIENT: { label: 'Novo Cliente', icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  CREATE_FARM: { label: 'Nova Fazenda', icon: MapPin, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CREATE_PLOT: { label: 'Novo Talhão', icon: Layers, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  CREATE_ORDER: { label: 'Novo Pedido', icon: FileText, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const OfflineSyncDialog: React.FC<OfflineSyncDialogProps> = ({ open, onOpenChange }) => {
  const {
    isOnline,
    pendingQueue,
    pendingCount,
    syncMeta,
    isPreparing,
    isSyncing,
    prepareForField,
    syncNow,
    removeQueueItem,
  } = useOffline();

  const lastSyncFormatted = syncMeta.lastSyncedAt
    ? new Date(syncMeta.lastSyncedAt).toLocaleString('pt-BR')
    : 'Ainda não preparado neste dispositivo';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-emerald-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-amber-600" />
            )}
            Modo Campo Offline & Sincronização
          </DialogTitle>
          <DialogDescription className="text-xs">
            Baixe os dados antes de ir para a fazenda para cadastrar clientes, fazendas, talhões e gerar pedidos sem internet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Status e Preparação Pré-Campo */}
          <div className="p-3.5 rounded-lg border bg-muted/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">Status da Conexão:</span>
                  {isOnline ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Online</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300">Offline (Modo Campo)</Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Última carga pré-campo: <strong className="text-foreground">{lastSyncFormatted}</strong>
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={prepareForField}
                disabled={!isOnline || isPreparing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
              >
                {isPreparing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CloudDownload className="h-3.5 w-3.5" />
                )}
                <span>{isPreparing ? 'Baixando dados...' : 'Preparar para Ir a Campo'}</span>
              </Button>
            </div>

            {syncMeta.counts && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t text-center">
                <div className="p-1.5 rounded bg-background border">
                  <span className="block text-[10px] text-muted-foreground">Clientes</span>
                  <strong className="text-sm">{syncMeta.counts.clients}</strong>
                </div>
                <div className="p-1.5 rounded bg-background border">
                  <span className="block text-[10px] text-muted-foreground">Fazendas</span>
                  <strong className="text-sm">{syncMeta.counts.farms}</strong>
                </div>
                <div className="p-1.5 rounded bg-background border">
                  <span className="block text-[10px] text-muted-foreground">Pedidos</span>
                  <strong className="text-sm">{syncMeta.counts.orders}</strong>
                </div>
                <div className="p-1.5 rounded bg-background border">
                  <span className="block text-[10px] text-muted-foreground">Variáveis</span>
                  <strong className="text-sm">{syncMeta.counts.costVariables}</strong>
                </div>
                <div className="p-1.5 rounded bg-background border">
                  <span className="block text-[10px] text-muted-foreground">Serviços</span>
                  <strong className="text-sm">{syncMeta.counts.services}</strong>
                </div>
                <div className="p-1.5 rounded bg-background border">
                  <span className="block text-[10px] text-muted-foreground">Produtos</span>
                  <strong className="text-sm">{syncMeta.counts.products}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Fila de Sincronização (Outbox) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" />
                Registros Pendentes de Envio ({pendingCount})
              </h4>

              {pendingCount > 0 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => syncNow(false)}
                  disabled={!isOnline || isSyncing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs h-7"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                </Button>
              )}
            </div>

            {pendingCount === 0 ? (
              <div className="p-6 text-center border rounded-lg bg-emerald-50/30 border-emerald-200 space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <p className="font-semibold text-emerald-900 text-xs">Tudo sincronizado!</p>
                <p className="text-[11px] text-muted-foreground">
                  Não há registros pendentes de envio ao servidor.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {pendingQueue.map((item) => {
                  const cfg = OP_LABELS[item.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border bg-card flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] gap-1 ${cfg.color}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                          <span className="font-semibold text-foreground truncate">{item.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Criado em {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </p>
                        {item.status === 'error' && item.errorMessage && (
                          <div className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{item.errorMessage}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.status === 'syncing' ? (
                          <Badge className="bg-blue-100 text-blue-800 text-[10px]">Enviando...</Badge>
                        ) : item.status === 'error' ? (
                          <Badge variant="destructive" className="text-[10px]">Erro</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                            Pendente
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQueueItem(item.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title="Descartar item da fila"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-3">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  User,
  Clock,
  CheckCircle2,
  Play,
  Calendar,
  DollarSign,
  Ban,
  Edit,
  ShieldCheck,
  FileText,
  ArrowRight,
  Database,
} from "lucide-react";
import { Order, OrderActionLog } from "@/hooks/useOrders";
import { api } from "@/services/api";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import { AUDIT_ACTION_CONFIG, AuditLogItem } from "../audit/AuditLogsPanel";

interface OrderHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export const OrderHistoryDialog: React.FC<OrderHistoryDialogProps> = ({
  open,
  onOpenChange,
  order,
}) => {
  const queryClient = useSafeQueryClient();

  const { data: serverAuditLogs = [], isLoading: loadingServerAudit } = useQuery<AuditLogItem[]>({
    queryKey: ["order-audit", order?.id],
    enabled: Boolean(open && order?.id),
    queryFn: async () => {
      if (!order?.id) return [];
      const data = await api.get<AuditLogItem[]>(`/audit-logs/entity/orders/${order.id}`);
      return Array.isArray(data) ? data : [];
    },
  }, queryClient);

  if (!order) return null;

  const logs: OrderActionLog[] = Array.isArray(order.logs) ? order.logs : [];

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'criação':
      case 'criado':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"><ShieldCheck className="w-3 h-3 mr-1" /> Criação</Badge>;
      case 'aprovação':
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprovação</Badge>;
      case 'conclusão':
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Conclusão</Badge>;
      case 'execução':
      case 'execução parcial':
      case 'concluído':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"><Play className="w-3 h-3 mr-1" /> Execução</Badge>;
      case 'agendamento':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100"><Calendar className="w-3 h-3 mr-1" /> Agendamento</Badge>;
      case 'pagamento':
      case 'baixa financeira':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"><DollarSign className="w-3 h-3 mr-1" /> Financeiro</Badge>;
      case 'edição':
      case 'editado':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100"><Edit className="w-3 h-3 mr-1" /> Edição</Badge>;
      case 'cancelamento':
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100"><Ban className="w-3 h-3 mr-1" /> Cancelamento</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <History className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Histórico de Ações do Pedido</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Auditoria completa de alterações, campos modificados e responsáveis pela operação
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Order Summary Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border rounded-lg text-xs">
          <div>
            <span className="text-muted-foreground block">Cliente:</span>
            <span className="font-semibold text-slate-800">{order.client?.name || 'Cliente'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Fazenda:</span>
            <span className="font-semibold text-slate-800">{order.farm?.name || 'Fazenda'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Serviço:</span>
            <span className="font-semibold text-slate-800">{order.serviceName || order.type}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Valor Atual:</span>
            <span className="font-semibold text-green-700">{order.value}</span>
          </div>
        </div>

        <Tabs defaultValue="timeline" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="timeline" className="text-xs gap-1.5">
              <History className="w-3.5 h-3.5" />
              Linha do Tempo ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="server" className="text-xs gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Auditoria do Servidor ({serverAuditLogs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-[46vh] pr-4">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-sm font-medium">Nenhum evento detalhado na linha do tempo</p>
                  <p className="text-xs">
                    Pedido criado em {formatDate(order.createdAt)} • Status atual: {order.status}
                  </p>
                </div>
              ) : (
                <div className="relative pl-7 space-y-5 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {logs.map((log, index) => (
                    <div key={log.id || index} className="relative flex flex-col gap-1 text-sm">
                      <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary" />

                      <div className="flex flex-wrap items-center gap-2">
                        {getActionBadge(log.action)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(log.timestamp)}
                        </span>
                      </div>

                      <div className="mt-1 bg-white border rounded-md p-3 shadow-sm space-y-2">
                        <p className="text-slate-800 font-medium text-sm">
                          {log.details || log.action}
                        </p>

                        {Array.isArray(log.changes) && log.changes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {log.changes.map((chg, chgIdx) => (
                              <span
                                key={chgIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
                              >
                                <strong>{chg.label}:</strong>
                                <span className="text-rose-700">{String(chg.before)}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-emerald-700 font-medium">{String(chg.after)}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {log.userName || 'Sistema'}
                          </span>
                          <span className="text-slate-400">ID: {log.id ? log.id.slice(0, 8) : String(index + 1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="server" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-[46vh] pr-4">
              {loadingServerAudit ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Carregando trilha do servidor...</div>
              ) : serverAuditLogs.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum registro posterior na tabela de auditoria do servidor para este pedido.
                </div>
              ) : (
                <div className="space-y-3">
                  {serverAuditLogs.map((audit) => {
                    const cfg = AUDIT_ACTION_CONFIG[audit.action] || {
                      label: audit.action,
                      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                    };
                    return (
                      <div key={audit.id} className="p-3 rounded-lg border bg-white text-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cfg.badgeClass}>
                              {cfg.label}
                            </Badge>
                            <span className="font-semibold text-slate-800">
                              {audit.user_name || "Sistema"}
                            </span>
                            {audit.user_role && (
                              <span className="text-muted-foreground">({audit.user_role})</span>
                            )}
                          </div>
                          <span className="text-muted-foreground">{formatDate(audit.created_at)}</span>
                        </div>

                        <p className="text-slate-700">{audit.summary}</p>

                        {Array.isArray(audit.changes) && audit.changes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {audit.changes.map((chg, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border text-[11px]"
                              >
                                <strong>{chg.label}:</strong>
                                <span className="text-rose-700">{String(chg.before)}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-emerald-700 font-medium">{String(chg.after)}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-1 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{audit.user_email || "-"}</span>
                          <span>IP: {audit.ip_address || "-"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

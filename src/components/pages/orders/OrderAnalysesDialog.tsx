import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';
import { FlaskConical, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SampleLabelsDialog } from '../analyses/SampleLabelsDialog';

interface OrderAnalysesDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysesList: any[];
}

export const OrderAnalysesDialog: React.FC<OrderAnalysesDialogProps> = ({
  order,
  open,
  onOpenChange,
  analysesList = [],
}) => {
  const navigate = useNavigate();
  const [showLabelsModal, setShowLabelsModal] = useState(false);

  // Filtra as análises enviadas para este pedido com proteção defensiva
  const safeAnalysesList = Array.isArray(analysesList) ? analysesList : [];
  const orderAnalyses = useMemo(() => {
    if (!order || !order.id) return [];
    return safeAnalysesList.filter((a) => a && (a.order_id === order.id || a.orderId === order.id));
  }, [order, safeAnalysesList]);

  // Quantidade total de análises contratadas no pedido
  const totalContracted = useMemo(() => {
    if (!order) return 0;
    if (order.totalSamples && Number(order.totalSamples) > 0) return Number(order.totalSamples);

    if (Array.isArray(order.productsData)) {
      const sum = order.productsData
        .filter((p: any) => {
          if (!p) return false;
          const id = String(p.id || '').toLowerCase();
          const name = String(p.name || '').toLowerCase();
          return (
            id.includes('analise') ||
            id.includes('amostr') ||
            name.includes('análise') ||
            name.includes('analise') ||
            name.includes('amostragem') ||
            name.includes('ponto') ||
            p.unit === 'PTOS'
          );
        })
        .reduce((acc: number, p: any) => acc + (Number(p.quantity) || 0), 0);
      if (sum > 0) return sum;
    }

    return 0;
  }, [order]);

  // Quantidade total já enviada ao laboratório
  const totalLabSent = useMemo(() => {
    return orderAnalyses.reduce((sum, a) => {
      const q = Number(a?.results?.quantity ?? a?.quantity ?? 1) || 1;
      return sum + q;
    }, 0);
  }, [orderAnalyses]);

  // Amostras físicas coletadas em campo pelos operadores
  const execSamples = useMemo(() => {
    if (!order) return 0;
    if (order.executedSamples && Number(order.executedSamples) > 0) return Number(order.executedSamples);
    const fieldSum = (Array.isArray(order.executions) ? order.executions : []).reduce(
      (sum: number, e: any) => sum + (Number(e?.samplesExecuted) || 0),
      0
    );
    // Coerência: no mínimo o que já foi enviado ao lab
    return Math.max(fieldSum, totalLabSent);
  }, [order, totalLabSent]);

  const remainingToSend = Math.max(0, totalContracted - totalLabSent);
  const percentLabSent = totalContracted > 0 ? Math.min(100, Math.round((totalLabSent / totalContracted) * 100)) : 0;
  const percentCollected = totalContracted > 0 ? Math.min(100, Math.round((execSamples / totalContracted) * 100)) : 0;

  // Formatação segura de datas para evitar crash de tipo Date vs string
  const formatDateSafe = (raw: any): string => {
    if (!raw) return '—';
    if (typeof raw === 'string') {
      if (raw.includes('T')) return raw.split('T')[0];
      return raw;
    }
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch {}
    return String(raw);
  };

  if (!order) return null;

  const clientName = order.client?.name || order.clientId || 'Cliente';
  const farmName = order.farm?.name || order.farmId || 'Fazenda';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <FlaskConical className="h-5 w-5 text-indigo-600" />
              Análises Laboratoriais do Pedido
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Detalhamento de amostras contratadas, coletadas em campo e remessas despachadas ao laboratório.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Barra de identificação do pedido */}
            <div className="p-3 border rounded-md bg-muted/30 text-xs space-y-1">
              <div className="flex justify-between items-center flex-wrap gap-1">
                <span className="font-semibold text-sm text-foreground">
                  {clientName} • {farmName}
                </span>
                <Badge variant="outline" className="text-[10px] font-medium">
                  {order.status}
                </Badge>
              </div>
              <div className="text-muted-foreground flex justify-between flex-wrap gap-1">
                <span>{order.serviceName || order.type} • {order.area ? `${order.area} ha` : 'Área não informada'}</span>
                <span>Pedido #{String(order.id).slice(0, 8)}</span>
              </div>
            </div>

            {/* Cards de Métricas Comparativas com Proteção de Overflow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg border bg-background text-center space-y-0.5 min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block truncate">Contratadas</span>
                <span className="text-lg font-bold text-foreground">
                  {totalContracted > 0 ? totalContracted : '—'}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">amostras</span>
              </div>

              <div className="p-2.5 rounded-lg border bg-emerald-50/50 border-emerald-200 text-center space-y-0.5 min-w-0">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block truncate">Coletadas Campo</span>
                <span className="text-lg font-bold text-emerald-700">
                  {execSamples}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block truncate">
                  {totalContracted > 0 ? `${percentCollected}% do total` : 'em campo'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border bg-indigo-50/60 border-indigo-200 text-center space-y-0.5 min-w-0">
                <span className="text-[10px] text-indigo-800 uppercase font-semibold block truncate">Enviadas Lab</span>
                <span className="text-lg font-bold text-indigo-700">
                  {totalLabSent}
                </span>
                <span className="text-[10px] text-indigo-700 font-medium block truncate">
                  {totalContracted > 0 ? `${percentLabSent}% do total` : 'ao laboratório'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border bg-background text-center space-y-0.5 min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block truncate">Saldo a Enviar</span>
                <span className={cn(
                  "text-lg font-bold",
                  remainingToSend > 0 ? "text-amber-600" : "text-emerald-600"
                )}>
                  {totalContracted > 0 ? remainingToSend : '0'}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {remainingToSend === 0 && totalContracted > 0 ? '100% enviadas' : 'restantes'}
                </span>
              </div>
            </div>

            {/* Comparativo de barras de progresso */}
            {totalContracted > 0 && (
              <div className="p-3 border rounded-lg bg-card space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px] flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block shrink-0" />
                    Coleta Física em Campo: <strong>{execSamples}/{totalContracted} ({percentCollected}%)</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-800 font-medium">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block shrink-0" />
                    Envio ao Laboratório: <strong>{totalLabSent}/{totalContracted} ({percentLabSent}%)</strong>
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-2 transition-all"
                    style={{ width: `${percentLabSent}%` }}
                    title={`Enviadas ao laboratório: ${totalLabSent}`}
                  />
                </div>
              </div>
            )}

            {/* Histórico detalhado de remessas enviadas com Rolagem Horizontal Segura */}
            <div className="space-y-2">
              <div className="flex justify-between items-center flex-wrap gap-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Remessas Enviadas para o Laboratório ({orderAnalyses.length})
                </h4>
                <span className="text-xs text-indigo-700 font-semibold">
                  Total enviado: {totalLabSent} amostras
                </span>
              </div>

              {orderAnalyses.length === 0 ? (
                <div className="p-6 border border-dashed rounded-lg text-center space-y-2 bg-muted/20">
                  <FlaskConical className="h-8 w-8 text-muted-foreground mx-auto stroke-1" />
                  <p className="text-xs font-semibold text-foreground">
                    Nenhuma remessa foi enviada ao laboratório para este pedido ainda.
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Você pode registrar remessas parciais ou totais pela tela da <strong>Agenda</strong> (botão Análises) ou diretamente na tela de <strong>Análises</strong>.
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-x-auto w-full">
                  <Table className="w-full min-w-[560px] text-xs">
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-[11px]">
                        <TableHead className="py-2 px-2.5">Tipo de Análise</TableHead>
                        <TableHead className="py-2 px-2.5 text-center">Qtd Amostras</TableHead>
                        <TableHead className="py-2 px-2.5">Data do Envio</TableHead>
                        <TableHead className="py-2 px-2.5">Talhão</TableHead>
                        <TableHead className="py-2 px-2.5">Status Lab</TableHead>
                        <TableHead className="py-2 px-2.5 text-right">Etiqueta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderAnalyses.map((item, idx) => {
                        const qty = Number(item?.results?.quantity ?? item?.quantity ?? 1) || 1;
                        const plot = item?.results?.plotName || item?.plotName || (item?.plot_id ? 'Talhão' : 'Geral');
                        const sendDate = formatDateSafe(item?.date || item?.created_at);
                        const tag = item?.results?.financialTag;

                        return (
                          <TableRow key={item?.id || idx} className="text-xs hover:bg-muted/30">
                            <TableCell className="py-2 px-2.5 font-medium">
                              <span className="font-semibold text-foreground">{item?.type || item?.analysisName || 'Análise'}</span>
                              {item?.results?.serviceName && (
                                <span className="text-[10px] text-muted-foreground block truncate max-w-[180px]">
                                  {item.results.serviceName}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="py-2 px-2.5 text-center whitespace-nowrap">
                              <Badge variant="secondary" className="font-bold text-xs bg-indigo-50 text-indigo-900 border-indigo-200">
                                {qty} {qty === 1 ? 'amostra' : 'amostras'}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-2 px-2.5 text-muted-foreground whitespace-nowrap">
                              {sendDate}
                            </TableCell>

                            <TableCell className="py-2 px-2.5">
                              <span className="inline-flex items-center gap-1 text-[11px] text-foreground">
                                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                {plot}
                              </span>
                            </TableCell>

                            <TableCell className="py-2 px-2.5 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] py-0 px-1.5 font-medium",
                                  item?.status === 'Finalizado' || item?.status === 'Concluído'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : item?.status === 'Recebido' || item?.status === 'Executando'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                )}
                              >
                                {item?.status || 'Pendente'}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-2 px-2.5 text-right whitespace-nowrap">
                              {tag ? (
                                <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border whitespace-nowrap">
                                  {tag}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 pt-3 border-t">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  window.dispatchEvent(new CustomEvent('farmflow-navigate', { detail: 'analysis' }));
                  navigate('/analises');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1 w-full sm:w-auto"
              >
                <span>Gerenciar Análises</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowLabelsModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 text-xs w-full sm:w-auto"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Emitir Etiquetas (TrackMaker)</span>
              </Button>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Etiquetas fora do Dialog pai para evitar colisão do Radix UI Portal */}
      {showLabelsModal && (
        <SampleLabelsDialog
          open={showLabelsModal}
          onOpenChange={setShowLabelsModal}
          initialFarmId={order.farmId || (order as any).farm_id || order.farm?.id}
          initialClientName={clientName}
          orderId={order.id}
        />
      )}
    </>
  );
};

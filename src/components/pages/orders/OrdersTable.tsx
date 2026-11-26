const formatServiceName = (name: string | null | undefined): string => {
  if (!name) return 'Serviço';
  let s = String(name);
  s = s.replace(/\uFFFD/g, 'ê');
  s = s.replace(/Confer[?\uFFFD]?ncia/gi, 'Conferência');
  s = s.replace(/ConferÃªncia/gi, 'Conferência');
  s = s.replace(/Conferncia/gi, 'Conferência');
  s = s.replace(/Compacta[?\uFFFD]?o|CompactaÃ§Ã£o|Compactao/gi, 'Compactação');
  s = s.replace(/Aplica[?\uFFFD]?o|AplicaÃ§Ã£o|Aplicao/gi, 'Aplicação');
  s = s.replace(/Pulveriza[?\uFFFD]?o|PulverizaÃ§Ã£o|Pulverizao/gi, 'Pulverização');
  s = s.replace(/Equaliza[?\uFFFD]?o|EqualizaÃ§Ã£o|Equalizao/gi, 'Equalização');
  return s;
};
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, CheckCircle2, Play, Calendar, DollarSign, Ban, Printer, History, FlaskConical, MoreHorizontal } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useFarms } from "@/hooks/useFarms";
import { OrderExecutionDialog } from "./OrderExecutionDialog";
import { OrderScheduleDialog } from "./OrderScheduleDialog";
import { OrderPaymentDialog } from "./OrderPaymentDialog";
import { OrderPrintDialog } from "./OrderPrintDialog";
import { OrderHistoryDialog } from "./OrderHistoryDialog";
import { OrderAnalysesDialog } from "./OrderAnalysesDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrdersTableProps {
  orders: Order[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onEdit: (order: Order) => void;
  onApprove: (orderId: string) => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
  onRecordExecution: (orderId: string, execution: any) => Promise<void>;
  onAddSchedule: (orderId: string, schedule: any) => Promise<void>;
  onRecordPayment: (orderId: string, payment: any) => Promise<void>;
  onSavePaymentSchedules?: (orderId: string, paymentSchedules: any[]) => Promise<void>;
  onPayScheduledInstallment?: (orderId: string, scheduleId: string, paymentData: any) => Promise<void>;
}

export const OrdersTable = ({
  orders,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onApprove,
  onCancel,
  onRecordExecution,
  onAddSchedule,
  onRecordPayment,
  onSavePaymentSchedules,
  onPayScheduledInstallment,
}: OrdersTableProps) => {
  const { clients } = useClients();
  const { farms } = useFarms();

  // Modals state
  const [selectedOrderForExec, setSelectedOrderForExec] = useState<Order | null>(null);
  const [selectedOrderForSched, setSelectedOrderForSched] = useState<Order | null>(null);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState<Order | null>(null);
  const [selectedOrderForAnalyses, setSelectedOrderForAnalyses] = useState<Order | null>(null);
  const [orderToApprove, setOrderToApprove] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [analysesList, setAnalysesList] = useState<any[]>([]);

  // Carrega remessas de análises para exibir contadores por pedido
  useEffect(() => {
    let isMounted = true;
    const loadAnalyses = async () => {
      try {
        const data = await api.get<any[]>('/analyses');
        if (isMounted && Array.isArray(data)) {
          setAnalysesList(data);
        }
      } catch {
        // Silencioso em caso de falha de conexão inicial
      }
    };
    loadAnalyses();

    const handleAnalysesUpdated = () => {
      loadAnalyses();
    };
    window.addEventListener('farmflow-analyses-updated', handleAnalysesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('farmflow-analyses-updated', handleAnalysesUpdated);
    };
  }, [orders]);

  const analysesCountByOrder = useMemo(() => {
    const counts: Record<string, number> = {};
    analysesList.forEach((a) => {
      if (a.order_id) {
        const qty = Number(a.results?.quantity ?? a.quantity ?? 1) || 1;
        counts[a.order_id] = (counts[a.order_id] || 0) + qty;
      }
    });
    return counts;
  }, [analysesList]);

  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    onItemsPerPageChange(parseInt(value));
    onPageChange(1);
  };

  const getClientName = (order: Order) => {
    if (order.client?.name) return order.client.name;
    const found = clients.find((c) => c.id === order.clientId);
    return found ? found.name : (order.clientId || 'Não informado');
  };

  const getFarmName = (order: Order) => {
    if (order.farm?.name) return order.farm.name;
    const found = farms.find((f) => f.id === order.farmId);
    return found ? found.name : (order.farmId || 'Não informada');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-100 text-green-800 border-green-200";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Aprovado":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "Pendente":
        return "bg-amber-100 text-amber-900 border-amber-300 font-medium";
      case "Cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentBadge = (payment: string) => {
    switch (payment) {
      case "Pago":
        return "bg-green-100 text-green-800 border-green-200";
      case "Parcial":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Aguardando":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };


  // Resolução dinâmica do pedido sempre atualizado para os modais
  const activeOrderForSched = selectedOrderForSched
    ? orders.find((o) => o.id === selectedOrderForSched.id) || selectedOrderForSched
    : null;

  const activeOrderForExec = selectedOrderForExec
    ? orders.find((o) => o.id === selectedOrderForExec.id) || selectedOrderForExec
    : null;

  const activeOrderForPay = selectedOrderForPay
    ? orders.find((o) => o.id === selectedOrderForPay.id) || selectedOrderForPay
    : null;

  const activeOrderForPrint = selectedOrderForPrint
    ? orders.find((o) => o.id === selectedOrderForPrint.id) || selectedOrderForPrint
    : null;

  const formatHa = (n: number) =>
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: n % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 2,
    });

  const renderOrderActions = (order: Order) => {
    const isCanceled = order.status === "Cancelado";
    const isPending = order.status === "Pendente";
    const sentAnalysesCount = analysesCountByOrder[order.id] || 0;
    const scheduleCount = order.schedules?.length || 0;

    return (
      <div className="flex items-center justify-end gap-1">
        {/* Botão de Destaque: Aprovar (quando Pendente de Aprovação) */}
        {isPending && !String(order.id).startsWith("offline-") && (
          <Button
            size="sm"
            className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-xs"
            onClick={() => setOrderToApprove(order)}
            title="Aprovar Pedido (Liberar Agendamento e Execução)"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-[11px]">Aprovar</span>
          </Button>
        )}

        {/* Botão de Ação Rápida: Imprimir Proposta / Pedido */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Imprimir Folha de Pedido"
              className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setSelectedOrderForPrint(order)}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Imprimir Pedido / Proposta</TooltipContent>
        </Tooltip>

        {/* Menu Inteligente Consolidado de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Mais Ações do Pedido"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground border-muted-foreground/20 hover:border-muted-foreground/40 shrink-0"
              title="Mais Ações"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs">
            {/* Seção Operacional */}
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-1">
              Operacional de Campo
            </DropdownMenuLabel>

            <DropdownMenuItem
              disabled={isPending || isCanceled}
              onClick={() => setSelectedOrderForSched(order)}
              className="flex items-center justify-between cursor-pointer py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-purple-600" />
                <span>Agendamentos & Visitas</span>
              </div>
              {scheduleCount > 0 && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.2 rounded-full">
                  {scheduleCount}
                </span>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={isPending || isCanceled}
              onClick={() => setSelectedOrderForExec(order)}
              className="flex items-center gap-2 cursor-pointer py-1.5 text-xs"
            >
              <Play className="h-3.5 w-3.5 text-blue-600" />
              <span>Registrar Execução</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setSelectedOrderForAnalyses(order)}
              className="flex items-center justify-between cursor-pointer py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="h-3.5 w-3.5 text-indigo-600" />
                <span>Análises Laboratoriais</span>
              </div>
              {sentAnalysesCount > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded-full">
                  {sentAnalysesCount}
                </span>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Seção Financeira */}
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-1">
              Financeiro
            </DropdownMenuLabel>

            <DropdownMenuItem
              disabled={isCanceled}
              onClick={() => setSelectedOrderForPay(order)}
              className="flex items-center justify-between cursor-pointer py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                <span>Cobrança & Pagamentos</span>
              </div>
              <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-medium border", getPaymentBadge(order.payment))}>
                {order.payment}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Seção Gestão */}
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-1">
              Gestão do Pedido
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => setSelectedOrderForPrint(order)}
              className="flex items-center gap-2 cursor-pointer py-1.5 text-xs"
            >
              <Printer className="h-3.5 w-3.5 text-slate-700" />
              <span>Imprimir Pedido / Proposta</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!isPending}
              onClick={() => {
                if (isPending) onEdit(order);
              }}
              className={cn(
                "flex items-center gap-2 py-1.5 text-xs",
                !isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}
              title={!isPending ? "Depois de aprovado, o pedido não pode ser editado" : "Editar Pedido"}
            >
              <Edit className="h-3.5 w-3.5 text-slate-600" />
              <span>Editar Pedido</span>
              {!isPending && (
                <span className="text-[10px] text-muted-foreground ml-auto font-medium">(Bloqueado)</span>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setSelectedOrderForHistory(order)}
              className="flex items-center gap-2 cursor-pointer py-1.5 text-xs"
            >
              <History className="h-3.5 w-3.5 text-slate-600" />
              <span>Histórico & Auditoria</span>
            </DropdownMenuItem>

            {isPending && !String(order.id).startsWith("offline-") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setOrderToApprove(order)}
                  className="flex items-center gap-2 cursor-pointer py-1.5 text-xs text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-semibold">Aprovar Pedido</span>
                </DropdownMenuItem>
              </>
            )}

            {!isCanceled && !String(order.id).startsWith("offline-") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setOrderToCancel(order)}
                  className="flex items-center gap-2 cursor-pointer py-1.5 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Cancelar Pedido</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Visão Mobile em Cards */}
        <div className="space-y-3 md:hidden">
          {currentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum pedido encontrado.
            </div>
          ) : (
            currentOrders.map((order) => {
              const totalArea = parseFloat(order.area) || 0;
              const executedArea = order.executedArea || 0;
              const percentExec = totalArea > 0 ? Math.min(100, (executedArea / totalArea) * 100) : 0;

              return (
                <div key={order.id} className="p-3.5 rounded-lg border bg-card space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{getClientName(order)}</p>
                      <p className="text-xs text-muted-foreground truncate">{getFarmName(order)}</p>
                    </div>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0", getStatusBadge(order.status))}>
                      {order.status === "Pendente" ? "Aguardando Aprovação" : order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    {order.type === "Produto" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 leading-snug">
                        🛒 Venda de Produtos
                      </span>
                    ) : (
                      <span className="inline-block font-medium px-2 py-0.5 rounded bg-muted leading-snug">
                        {formatServiceName(order.serviceName || order.type)}
                      </span>
                    )}
                    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap", getPaymentBadge(order.payment))}>
                      {order.payment}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {order.type === "Produto" ? "Itens da Venda" : "Área / Execução"}
                      </span>
                      <span className="font-medium">
                        {order.type === "Produto"
                          ? (Array.isArray(order.productsData) && order.productsData.length > 0
                              ? `${order.productsData.length} ${order.productsData.length === 1 ? 'produto' : 'produtos'}`
                              : "Venda Direta")
                          : (totalArea > 0 ? `${formatHa(executedArea)} / ${formatHa(totalArea)} ha (${percentExec.toFixed(0)}%)` : "-")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[11px]">Valor</span>
                      <span className="font-bold text-sm text-foreground">{order.value || "R$ 0,00"}</span>
                      {order.paymentSchedules && order.paymentSchedules.length > 0 && (
                        <span className="text-[10px] text-amber-800 font-medium block">
                          💰 {order.paymentSchedules.filter((s: any) => s.status === 'Pago').length}/{order.paymentSchedules.length} pagos
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Responsável Mobile */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-500">👤</span>
                      <span className="font-medium text-foreground truncate">
                        {order.responsibleName || order.creatorName || "Sistema"}
                      </span>
                    </div>
                    {order.creatorName && order.responsibleName && order.creatorName.toLowerCase().trim() !== order.responsibleName.toLowerCase().trim() && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                        Criado por {order.creatorName}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    {renderOrderActions(order)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Visão Desktop em Tabela */}
        <div className="hidden md:block overflow-x-auto w-full rounded-md border border-slate-200/70">
          <Table className="w-full text-xs sm:text-sm">
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b">
              <TableHead className="px-3.5 py-3 font-semibold text-slate-700 min-w-[190px]">Cliente / Fazenda</TableHead>
              <TableHead className="px-3 py-3 font-semibold text-slate-700 min-w-[160px]">Serviço & Área</TableHead>
              <TableHead className="px-3 py-3 font-semibold text-slate-700 min-w-[135px]">Execução</TableHead>
              <TableHead className="px-3 py-3 font-semibold text-slate-700 min-w-[130px]">Valor / Pagamento</TableHead>
              <TableHead className="px-3 py-3 font-semibold text-slate-700 min-w-[140px]">Responsável</TableHead>
              <TableHead className="px-3 py-3 font-semibold text-slate-700 min-w-[125px]">Status</TableHead>
              <TableHead className="px-3 py-3 font-semibold text-slate-700 text-right w-[110px] shrink-0">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              currentOrders.map((order) => {
                const totalArea = parseFloat(order.area) || 0;
                const executedArea = order.executedArea || 0;
                const percentExec = totalArea > 0 ? Math.min(100, (executedArea / totalArea) * 100) : 0;

                // Análises Contratadas e Realizadas (Pilar 2)
                const totalSamples = order.totalSamples || (
                  Array.isArray(order.productsData)
                    ? order.productsData
                        .filter((p: any) =>
                          ['analises_completa', 'analises_macro', 'analises_macro_prem', 'analises_20_40', 'analise_fisica', 'analise_foliar', 'pontos', 'analises_inclusas'].includes(p.id) ||
                          p.unit === 'PTOS' ||
                          (p.name && /análise|analise|ponto/i.test(p.name))
                        )
                        .reduce((sum: number, p: any) => sum + (Number(p.quantity) || 0), 0)
                    : 0
                );
                const execSamples = order.executedSamples || (order.executions || []).reduce((sum, e) => sum + (Number(e.samplesExecuted) || 0), 0);
                const sentSamples = analysesCountByOrder[order.id] || 0;
                // Coerência operacional: se amostras já foram despachadas ao laboratório, elas necessariamente já foram coletadas no campo
                const effectiveCollected = Math.max(execSamples, sentSamples);
                const plotNames = order.plots && Array.isArray(order.plots) && order.plots.length > 0
                  ? order.plots.map((p: any) => p.name).join(', ')
                  : null;

                const contractYears =
                  order.contractYears ||
                  (order.serviceDetails?.contractYears) ||
                  (order.serviceName?.match(/(\d+)\s*anos/i)?.[1] ? parseInt(order.serviceName.match(/(\d+)\s*anos/i)![1], 10) : null) ||
                  (Array.isArray(order.paymentSchedules) && order.paymentSchedules.length > 0
                    ? Math.max(...order.paymentSchedules.map((p: any) => p.cycleYear || 1), 1)
                    : 1);

                const realizedSafrasFromVisits = new Set(
                  (order.schedules || [])
                    .filter((s: any) => s.status === 'Realizado' && s.yearCycle)
                    .map((s: any) => s.yearCycle)
                ).size;

                const realizedSafrasFromArea =
                  totalArea > 0 && contractYears > 1
                    ? Math.min(contractYears, Math.floor((executedArea / totalArea) * contractYears))
                    : (executedArea > 0 ? 1 : 0);

                const executedSafras = Math.max(realizedSafrasFromVisits, realizedSafrasFromArea);

                return (
                  <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                    {/* 1. Cliente & Fazenda */}
                    <TableCell className="px-3.5 py-3 align-middle">
                      <div className="font-semibold text-foreground text-sm leading-snug whitespace-normal">
                        {getClientName(order)}
                      </div>
                      <div className="text-xs text-muted-foreground leading-snug mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-slate-600">🏡 {getFarmName(order)}</span>
                        {plotNames && (
                          <span className="text-primary font-normal text-[11px] inline-flex items-center gap-0.5">
                            • 📍 {plotNames}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 2. Serviço & Área */}
                    <TableCell className="px-3 py-3 align-middle">
                      {order.type === "Produto" ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 leading-snug whitespace-nowrap">
                            🛒 Venda de Produtos
                          </span>
                          {Array.isArray(order.productsData) && order.productsData.length > 0 && (
                            <div className="text-[11px] text-muted-foreground">
                              {order.productsData.length} {order.productsData.length === 1 ? 'produto' : 'produtos'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-medium text-foreground text-xs leading-snug">
                            {formatServiceName(order.serviceName || order.type)}
                          </div>
                          {totalArea > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded whitespace-nowrap">
                              📐 {totalArea.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* 3. Execução */}
                    <TableCell className="px-3 py-3 align-middle">
                      {order.type === "Produto" ? (
                        <div className="text-xs space-y-0.5">
                          <span className="font-medium text-slate-700 block">
                            {Array.isArray(order.productsData) && order.productsData.length > 0
                              ? `${order.productsData.length} ${order.productsData.length === 1 ? 'item' : 'itens'}`
                              : 'Venda Direta'}
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]" title={Array.isArray(order.productsData) ? order.productsData.map((p: any) => `${p.quantity || 1} ${p.unit || ''} ${p.name || ''}`).join(', ') : ''}>
                            {Array.isArray(order.productsData) && order.productsData.length > 0
                              ? order.productsData.map((p: any) => `${p.quantity || 1} ${p.unit || ''} ${p.name || ''}`).join(', ')
                              : 'Produtos'}
                          </span>
                        </div>
                      ) : (
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[11px] gap-1">
                            <span className="font-bold text-xs text-slate-900">{percentExec.toFixed(0)}%</span>
                            <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                              {formatHa(executedArea)}/{formatHa(totalArea)} ha
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                            <div
                              className={cn(
                                "h-1.5 rounded-full transition-all",
                                percentExec >= 100 ? "bg-emerald-600" : percentExec > 0 ? "bg-blue-600" : "bg-muted-foreground/30"
                              )}
                              style={{ width: percentExec + '%' }}
                            />
                          </div>
                          {totalSamples > 0 ? (
                            <div className="space-y-0.5 pt-0.5 border-t border-muted/80">
                              <div className="text-[10px] text-emerald-800 font-medium flex justify-between items-center" title="Amostras físicas coletadas no campo">
                                <span>🌱 Coletadas:</span>
                                <span className="font-bold">{effectiveCollected}/{totalSamples}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForAnalyses(order)}
                                className="text-[10px] text-indigo-700 hover:text-indigo-900 hover:underline font-medium flex justify-between items-center w-full cursor-pointer text-left"
                                title="Clique para ver detalhes das análises laboratoriais"
                              >
                                <span>🔬 Lab:</span>
                                <span className="font-bold">{sentSamples}/{totalSamples}</span>
                              </button>
                            </div>
                          ) : sentSamples > 0 ? (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForAnalyses(order)}
                              className="text-[10px] text-indigo-700 hover:text-indigo-900 hover:underline font-medium flex justify-between items-center w-full cursor-pointer text-left pt-0.5 border-t border-muted/80"
                              title="Clique para ver detalhes das análises laboratoriais"
                            >
                              <span>🔬 Lab:</span>
                              <span className="font-bold">{sentSamples}</span>
                            </button>
                          ) : null}
                          {contractYears > 1 && (
                            <div
                              className="text-[10px] text-emerald-800 font-semibold flex justify-between items-center pt-0.5 border-t border-muted/80"
                              title={`${executedSafras} de ${contractYears} safras anuais executadas no campo`}
                            >
                              <span>🌾 Safras:</span>
                              <span className="font-bold">{executedSafras}/{contractYears}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* 4. Valor & Pagamento */}
                    <TableCell className="px-3 py-3 align-middle whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm">
                        {order.value || 'R$ 0,00'}
                      </div>
                      <div className="mt-1 flex flex-col items-start gap-0.5">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border", getPaymentBadge(order.payment))}>
                          {order.payment}
                        </span>
                        {order.paymentSchedules && order.paymentSchedules.length > 0 && (
                          <div
                            className="text-[10px] text-amber-800 font-medium flex items-center gap-1"
                            title={`${order.paymentSchedules.filter((s: any) => s.status === 'Pago').length} de ${order.paymentSchedules.length} pagamentos/parcelas quitadas`}
                          >
                            <span>💰</span> {order.paymentSchedules.filter((s: any) => s.status === 'Pago').length}/{order.paymentSchedules.length} pagamentos
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* 5. Responsável & Atribuição */}
                    <TableCell className="px-3 py-3 align-middle text-xs">
                      {(() => {
                        const resp = order.responsibleName || order.creatorName || (order as any).userName || "Sistema";
                        const creator = order.creatorName || (order as any).userName;
                        const isTransferred = Boolean(
                          creator &&
                          resp &&
                          creator.toLowerCase().trim() !== resp.toLowerCase().trim()
                        );

                        return (
                          <div className="space-y-1">
                            <div className="font-medium text-foreground flex items-center gap-1.5">
                              <span className="text-slate-500">👤</span>
                              <span className="truncate max-w-[130px]" title={resp}>
                                {resp}
                              </span>
                            </div>
                            {isTransferred ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded"
                                title={`Atribuído para ${resp}. Criado originalmente por: ${creator}`}
                              >
                                ↳ De: {creator}
                              </span>
                            ) : creator ? (
                              <span className="text-[10px] text-muted-foreground block">
                                Criador
                              </span>
                            ) : null}
                          </div>
                        );
                      })()}
                    </TableCell>

                    {/* 6. Status do Pedido */}
                    <TableCell className="px-3 py-3 align-middle">
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn("inline-block px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap", getStatusBadge(order.status))}>
                          {order.status === "Pendente" ? "Aguardando Aprovação" : order.status}
                        </span>
                        {String(order.id).startsWith("offline-") && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                            Salvo offline
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 6. Ações */}
                    <TableCell className="px-3 py-3 align-middle text-right whitespace-nowrap">
                      {renderOrderActions(order)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Mostrando {totalItems > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, totalItems)} de {totalItems} pedidos
            </span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">por página</span>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* Lifecycle Modals */}
        <OrderExecutionDialog
          order={activeOrderForExec}
          open={!!selectedOrderForExec}
          onOpenChange={(op) => !op && setSelectedOrderForExec(null)}
          onRecordExecution={onRecordExecution}
        />

        <OrderScheduleDialog
          order={activeOrderForSched}
          open={!!selectedOrderForSched}
          onOpenChange={(op) => !op && setSelectedOrderForSched(null)}
          onAddSchedule={onAddSchedule}
        />

        <OrderPaymentDialog
          order={activeOrderForPay}
          open={!!selectedOrderForPay}
          onOpenChange={(op) => !op && setSelectedOrderForPay(null)}
          onRecordPayment={onRecordPayment}
          onSavePaymentSchedules={onSavePaymentSchedules}
          onPayScheduledInstallment={onPayScheduledInstallment}
        />
      </div>
    
      {/* Modal de Impressão de Folha de Pedido */}
      <OrderPrintDialog
        order={activeOrderForPrint}
        client={selectedOrderForPrint ? clients.find((c) => c.id === selectedOrderForPrint.clientId) : null}
        farm={selectedOrderForPrint ? farms.find((f) => f.id === selectedOrderForPrint.farmId) : null}
        open={!!selectedOrderForPrint}
        onOpenChange={(open) => !open && setSelectedOrderForPrint(null)}
      />

      {/* Modal de Histórico de Ações */}
      <OrderHistoryDialog
        order={selectedOrderForHistory}
        open={!!selectedOrderForHistory}
        onOpenChange={(open) => !open && setSelectedOrderForHistory(null)}
      />

      {/* Modal de Detalhamento de Análises Laboratoriais */}
      <OrderAnalysesDialog
        order={selectedOrderForAnalyses}
        open={!!selectedOrderForAnalyses}
        onOpenChange={(open) => !open && setSelectedOrderForAnalyses(null)}
        analysesList={analysesList}
      />

      {/* Confirmação de Aprovação de Pedido */}
      <AlertDialog open={!!orderToApprove} onOpenChange={(open) => !open && setOrderToApprove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Aprovar Pedido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Deseja aprovar o pedido de <strong>{orderToApprove ? getClientName(orderToApprove) : ''}</strong> referente a{" "}
              <strong>{orderToApprove ? (orderToApprove.serviceName || orderToApprove.type) : ''}</strong> no valor de{" "}
              <strong className="text-slate-900">{orderToApprove?.value || 'R$ 0,00'}</strong>?
              <br className="my-1.5" />
              O status mudará para <span className="font-semibold text-emerald-700">Aprovado</span> e liberará o agendamento de etapas no campo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (orderToApprove) {
                  onApprove(orderToApprove.id);
                  setOrderToApprove(null);
                }
              }}
            >
              Confirmar Aprovação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de Cancelamento de Pedido */}
      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Cancelar Pedido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Tem certeza que deseja cancelar o pedido de <strong>{orderToCancel ? getClientName(orderToCancel) : ''}</strong>?
              <br className="my-1.5" />
              Esta ação marcará o pedido como <span className="font-semibold text-rose-700">Cancelado</span>. O pedido não poderá mais receber novos agendamentos nem execuções operacionais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (orderToCancel) {
                  onCancel(orderToCancel.id);
                  setOrderToCancel(null);
                }
              }}
            >
              Sim, Cancelar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

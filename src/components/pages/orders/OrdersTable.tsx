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
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, CheckCircle2, Play, Calendar, DollarSign, Ban, Printer, History } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useFarms } from "@/hooks/useFarms";
import { OrderExecutionDialog } from "./OrderExecutionDialog";
import { OrderScheduleDialog } from "./OrderScheduleDialog";
import { OrderPaymentDialog } from "./OrderPaymentDialog";
import { OrderPrintDialog } from "./OrderPrintDialog";
import { OrderHistoryDialog } from "./OrderHistoryDialog";
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
}: OrdersTableProps) => {
  const { clients } = useClients();
  const { farms } = useFarms();

  // Modals state
  const [selectedOrderForExec, setSelectedOrderForExec] = useState<Order | null>(null);
  const [selectedOrderForSched, setSelectedOrderForSched] = useState<Order | null>(null);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState<Order | null>(null);

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
        return "bg-amber-100 text-amber-800 border-amber-200";
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

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
          <Table className="min-w-[850px] w-full text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fazenda</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Execução</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              currentOrders.map((order) => {
                const totalArea = parseFloat(order.area) || 0;
                const executedArea = order.executedArea || 0;
                const percentExec = totalArea > 0 ? Math.min(100, (executedArea / totalArea) * 100) : 0;

                return (
                  <TableRow key={order.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium text-foreground">
                      {getClientName(order)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {getFarmName(order)}
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-xs px-2 py-0.5 rounded bg-muted">
                        {formatServiceName(order.serviceName || order.type)}
                      </span>
                    </TableCell>

                    <TableCell>
                      {totalArea > 0 ? totalArea.toFixed(1) + ' ha' : '-'}
                    </TableCell>

                    <TableCell>
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-xs">{percentExec.toFixed(0)}%</span>
                          <span className="text-muted-foreground text-[10px]">
                            {executedArea.toFixed(0)}/{totalArea.toFixed(0)} ha
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              percentExec >= 100 ? "bg-green-600" : percentExec > 0 ? "bg-blue-600" : "bg-muted-foreground/30"
                            )}
                            style={{ width: percentExec + '%' }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-foreground">
                      {order.value || 'R$ 0,00'}
                    </TableCell>

                    <TableCell>
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusBadge(order.status))}>
                        {order.status}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getPaymentBadge(order.payment))}>
                        {order.payment}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botão Aprovar (se Pendente) */}
                        {order.status === "Pendente" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => {
                                  if (confirm("Deseja aprovar este pedido?")) {
                                    onApprove(order.id);
                                  }
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Aprovar Pedido</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Botão Executar (100% ou Parcial) */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => setSelectedOrderForExec(order)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Registrar Execução (100% ou Parcial)</TooltipContent>
                        </Tooltip>

                        {/* Botão Agendamento */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              onClick={() => setSelectedOrderForSched(order)}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Agendamentos / Etapas ({order.schedules?.length || 0})</TooltipContent>
                        </Tooltip>

                        {/* Botão Cobrar / Pagamento */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => setSelectedOrderForPay(order)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cobrança / Pagamentos ({order.payment})</TooltipContent>
                        </Tooltip>

                                                {/* Botão Imprimir Folha de Pedido */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                              onClick={() => setSelectedOrderForPrint(order)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Imprimir Folha de Pedido / Orçamento</TooltipContent>
                        </Tooltip>

                        {/* Botão Histórico de Ações */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              onClick={() => setSelectedOrderForHistory(order)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Histórico de Ações / Auditoria</TooltipContent>
                        </Tooltip>

                        {/* Botão Editar */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => onEdit(order)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar Pedido</TooltipContent>
                        </Tooltip>

                        {/* Botão Cancelar */}
                        {order.status !== "Cancelado" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (confirm("Tem certeza que deseja cancelar este pedido?")) {
                                    onCancel(order.id);
                                  }
                                }}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancelar Pedido</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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
              Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} pedidos
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
    </TooltipProvider>
  );
};

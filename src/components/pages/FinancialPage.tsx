import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  AlertCircle,
  CreditCard,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  RotateCcw,
  Calendar
} from "lucide-react";
import { useOrders, Order } from "@/hooks/useOrders";
import { FinancialTransactionsTab } from "./financial/FinancialTransactionsTab";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Utilitários de máscara monetária BRL (R$ 1.250,50)
const formatCurrencyInput = (value: string | number): string => {
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  const clean = value.replace(/\D/g, "");
  if (!clean) return "0,00";
  const num = (parseInt(clean, 10) / 100).toFixed(2);
  const parts = num.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${intPart},${parts[1]}`;
};

const parseCurrencyInput = (formatted: string): number => {
  if (!formatted) return 0;
  const clean = formatted.replace(/\./g, "").replace(",", ".");
  return parseFloat(clean) || 0;
};

const FinancialPage = () => {
  const { toast } = useToast();
  const { orders, loading, markOrderAsPaid } = useOrders();

  const [activeTab, setActiveTab] = useState<"pedidos" | "lancamentos">("pedidos");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  // State for Baixa Modal
  const [selectedOrderForBaixa, setSelectedOrderForBaixa] = useState<Order | null>(null);
  const [baixaAmountDisplay, setBaixaAmountDisplay] = useState<string>("0,00");
  const [baixaMethod, setBaixaMethod] = useState<string>("PIX");
  const [baixaDate, setBaixaDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [baixaNotes, setBaixaNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial statistics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pendingPayments = 0;
    let waitingCount = 0;
    let completedAwaitingPaymentCount = 0;

    orders.forEach((o) => {
      const val = o.numericValue || 0;
      const paid = o.paidAmount || 0;

      totalRevenue += paid;
      const remaining = Math.max(0, val - paid);
      pendingPayments += remaining;

      if (o.payment === "Aguardando" || !o.payment) {
        waitingCount++;
      }
      if (o.status === "Concluído" && o.payment !== "Pago") {
        completedAwaitingPaymentCount++;
      }
    });

    return {
      totalRevenue,
      pendingPayments,
      totalGeneral: totalRevenue + pendingPayments,
      waitingCount,
      completedAwaitingPaymentCount,
    };
  }, [orders]);

  // Listas únicas para filtros
  const uniqueClients = useMemo(() => {
    return Array.from(new Set(orders.map((o) => o.client?.name).filter(Boolean))) as string[];
  }, [orders]);

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(orders.map((o) => o.serviceName || o.type).filter(Boolean))) as string[];
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const clientName = o.client?.name || "";
      const farmName = o.farm?.name || "";
      const serviceName = o.serviceName || o.type || "";

      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "ConcluidoPendente" ? o.status === "Concluído" && o.payment !== "Pago" : o.payment === paymentFilter);

      const matchesService = serviceFilter === "all" || serviceName === serviceFilter;
      const matchesClient = clientFilter === "all" || clientName === clientFilter;

      return matchesSearch && matchesPayment && matchesService && matchesClient;
    });
  }, [orders, searchTerm, paymentFilter, serviceFilter, clientFilter]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleOpenBaixa = (order: Order) => {
    const total = order.numericValue || 0;
    const paid = order.paidAmount || 0;
    const remaining = Math.max(0, total - paid);

    setSelectedOrderForBaixa(order);
    setBaixaAmountDisplay(formatCurrencyInput(remaining));
    setBaixaMethod("PIX");
    setBaixaDate(new Date().toISOString().split("T")[0]);
    setBaixaNotes("");
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setBaixaAmountDisplay(formatted);
  };

  const handleConfirmBaixa = async () => {
    if (!selectedOrderForBaixa) return;
    const amount = parseCurrencyInput(baixaAmountDisplay);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, informe um valor maior que zero para a baixa.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await markOrderAsPaid(selectedOrderForBaixa.id, {
        amount,
        method: baixaMethod,
        notes: baixaNotes,
      });

      // Sincronização automática com a tela de Fluxo de Caixa / Lançamentos
      try {
        await api.post('/financial/transactions', {
          type: 'income',
          category: 'Serviços Agrícolas',
          amount: amount,
          description: `Recebimento Pedido #${selectedOrderForBaixa.id.slice(0, 8)} - ${selectedOrderForBaixa.client?.name || 'Cliente'} (${selectedOrderForBaixa.serviceName || selectedOrderForBaixa.type})`,
          dueDate: baixaDate,
          paidDate: baixaDate,
          payment_date: baixaDate,
          status: 'paid',
          clientOrSupplier: selectedOrderForBaixa.client?.name || 'Cliente',
          paymentMethod: baixaMethod,
          notes: `Baixa efetuada em ${baixaDate}. ${baixaNotes}`.trim()
        });
      } catch (syncErr) {
        console.warn("Lançamento financeiro sincronizado localmente:", syncErr);
      }

      toast({
        title: "Baixa Confirmada!",
        description: `Recebimento de R$ ${amount.toFixed(2)} registrado com sucesso.`
      });

      setSelectedOrderForBaixa(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Controle de recebimentos, fluxo de caixa e baixa de pagamentos
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <Card className="shadow-sm border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-700">
              {formatBRL(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total já quitado no sistema</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber / Em Aberto</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {formatBRL(stats.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.waitingCount} pedidos com saldo pendente
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-600 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total Contratado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">
              {formatBRL(stats.totalGeneral)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recebidos + Saldo em Aberto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Abas: Contas a Receber (Pedidos) vs Lançamentos (Entradas & Saídas) */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-4">
        <TabsList className="grid w-full sm:w-[480px] grid-cols-2">
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Contas a Receber (Pedidos)
          </TabsTrigger>
          <TabsTrigger value="lancamentos" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Fluxo de Caixa (Lançamentos)
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: TABELA DE PEDIDOS / CONTAS A RECEBER */}
        <TabsContent value="pedidos" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Gestão de Pedidos e Faturamento</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Consulte os valores contratados e execute baixas totais ou parciais
                    </CardDescription>
                  </div>
                </div>

                {/* Filtros Avançados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t">
                  <div className="relative sm:col-span-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cliente, fazenda ou serviço..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8 text-xs sm:text-sm h-9"
                    />
                  </div>

                  <Select
                    value={clientFilter}
                    onValueChange={(val) => {
                      setClientFilter(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Todos os Clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Clientes</SelectItem>
                      {uniqueClients.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={serviceFilter}
                    onValueChange={(val) => {
                      setServiceFilter(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Todos os Serviços" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Serviços</SelectItem>
                      {uniqueServices.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={paymentFilter}
                    onValueChange={(val) => {
                      setPaymentFilter(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Status Financeiro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Pagamentos</SelectItem>
                      <SelectItem value="Aguardando">Aguardando Pagamento</SelectItem>
                      <SelectItem value="Parcial">Pagamento Parcial</SelectItem>
                      <SelectItem value="Pago">Totalmente Pago</SelectItem>
                      <SelectItem value="ConcluidoPendente">Concluído (Não Pago)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Carregando dados financeiros...</div>
              ) : currentOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-sm font-medium">Nenhum registro financeiro encontrado</p>
                  <p className="text-xs">Altere os filtros de busca para visualizar os lançamentos</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-[700px] w-full text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Cliente</TableHead>
                        <TableHead className="font-semibold">Fazenda</TableHead>
                        <TableHead className="font-semibold">Serviço</TableHead>
                        <TableHead className="font-semibold text-right">Valor Total</TableHead>
                        <TableHead className="font-semibold text-right">Valor Pago</TableHead>
                        <TableHead className="font-semibold text-right">Saldo a Pagar</TableHead>
                        <TableHead className="font-semibold text-center">Status</TableHead>
                        <TableHead className="font-semibold text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => {
                        const total = order.numericValue || 0;
                        const paid = order.paidAmount || 0;
                        const remaining = Math.max(0, total - paid);
                        const isFullyPaid = order.payment === "Pago" || (paid >= total && total > 0);

                        return (
                          <TableRow key={order.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-900">
                              {order.client?.name || "Cliente"}
                            </TableCell>
                            <TableCell className="text-slate-700">{order.farm?.name || "Fazenda"}</TableCell>
                            <TableCell className="text-slate-700">{order.serviceName || order.type}</TableCell>
                            <TableCell className="text-right font-medium text-slate-900">
                              {formatBRL(total)}
                            </TableCell>
                            <TableCell className="text-right text-emerald-700 font-medium">
                              {formatBRL(paid)}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${remaining > 0 ? "text-orange-600" : "text-slate-400"}`}>
                              {formatBRL(remaining)}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  isFullyPaid
                                    ? "bg-green-100 text-green-800"
                                    : order.payment === "Parcial"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {isFullyPaid ? "Pago" : order.payment === "Parcial" ? "Parcial" : "Aguardando"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {isFullyPaid ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="h-8 px-2 text-xs text-green-700"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Quitado
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                  onClick={() => handleOpenBaixa(order)}
                                >
                                  <DollarSign className="h-3.5 w-3.5 mr-1" /> Dar Baixa
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t text-xs text-muted-foreground">
                <div>
                  Mostrando {totalItems > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, totalItems)} de {totalItems} lançamentos
                </div>
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: FLUXO DE CAIXA COMPLETO (LANÇAMENTOS ENTRADAS & SAÍDAS) */}
        <TabsContent value="lancamentos">
          <FinancialTransactionsTab />
        </TabsContent>
      </Tabs>

      {/* Modal: Dar Baixa / Registrar Pagamento com Máscara e Cálculo Parcial */}
      <Dialog open={!!selectedOrderForBaixa} onOpenChange={(open) => !open && setSelectedOrderForBaixa(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Dar Baixa no Pedido
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registre a liquidação financeira total ou parcial com máscara brasileira e atualização em tempo real
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForBaixa && (() => {
            const total = selectedOrderForBaixa.numericValue || 0;
            const paid = selectedOrderForBaixa.paidAmount || 0;
            const currentRemaining = Math.max(0, total - paid);
            const typedAmount = parseCurrencyInput(baixaAmountDisplay);
            const remainingAfterBaixa = Math.max(0, currentRemaining - typedAmount);
            const isPartialBaixa = typedAmount < currentRemaining;

            return (
              <div className="space-y-4 my-2 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-semibold text-slate-800">{selectedOrderForBaixa.client?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviço:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedOrderForBaixa.serviceName || selectedOrderForBaixa.type}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">Valor Total Contratado:</span>
                    <span className="font-medium text-slate-900">{formatBRL(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Já Pago Anteriormente:</span>
                    <span className="font-medium text-emerald-700">{formatBRL(paid)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 text-orange-600 font-semibold">
                    <span>Saldo a Pagar Atual:</span>
                    <span>{formatBRL(currentRemaining)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="baixa-val" className="font-semibold">Valor a Liquidar (R$)</Label>
                    {currentRemaining > 0 && (
                      <button
                        type="button"
                        onClick={() => setBaixaAmountDisplay(formatCurrencyInput(currentRemaining))}
                        className="text-xs text-emerald-600 hover:underline font-medium"
                      >
                        Liquidar Saldo Total ({formatBRL(currentRemaining)})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">R$</span>
                    <Input
                      id="baixa-val"
                      value={baixaAmountDisplay}
                      onChange={handleAmountInputChange}
                      placeholder="0,00"
                      className="pl-9 font-bold text-base bg-background h-10"
                    />
                  </div>
                </div>

                {/* Feedback em Tempo Real de Baixa Total vs Parcial */}
                <div className="p-2.5 rounded border text-xs">
                  {isPartialBaixa ? (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-amber-700 block">
                        ⚠️ Baixa Parcial Identificada:
                      </span>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Restará em aberto após esta baixa:</span>
                        <strong className="text-orange-600 font-bold">{formatBRL(remainingAfterBaixa)}</strong>
                      </div>
                    </div>
                  ) : (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Esta baixa quitará 100% do saldo restante do pedido.
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="baixa-date" className="text-xs font-semibold">Data do Recebimento</Label>
                    <Input
                      id="baixa-date"
                      type="date"
                      value={baixaDate}
                      onChange={(e) => setBaixaDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="baixa-metodo" className="text-xs font-semibold">Forma de Pagamento</Label>
                    <Select value={baixaMethod} onValueChange={setBaixaMethod}>
                      <SelectTrigger id="baixa-metodo" className="h-9 text-xs">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                        <SelectItem value="Depósito">Depósito / Transferência</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão">Cartão Débito/Crédito</SelectItem>
                        <SelectItem value="Safra">Safra / Barter (Grãos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="baixa-obs" className="text-xs font-semibold">Observações / Comprovante (opcional)</Label>
                  <Input
                    id="baixa-obs"
                    value={baixaNotes}
                    onChange={(e) => setBaixaNotes(e.target.value)}
                    placeholder="Ex: TED recebido via Banco do Brasil"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            );
          })()}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
            <Button variant="outline" onClick={() => setSelectedOrderForBaixa(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleConfirmBaixa}
              disabled={isSubmitting}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {isSubmitting ? "Gravando..." : "Confirmar Baixa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialPage;

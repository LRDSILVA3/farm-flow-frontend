import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Clock, Play, CheckCircle2, DollarSign, RotateCcw } from "lucide-react";
import { OrdersTable } from "./orders/OrdersTable";
import { OrderForm } from "./orders/OrderForm";
import { useOrders, Order } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useFarms } from "@/hooks/useFarms";
import { useToast } from "@/hooks/use-toast";

const OrdersPage = () => {
  const { toast } = useToast();
  const {
    orders,
    showOrderForm,
    setShowOrderForm,
    editingOrder,
    setEditingOrder,
    formData,
    setFormData,
    addOrder,
    updateOrder,
    approveOrder,
    cancelOrder,
    recordExecution,
    addSchedule,
    recordPayment,
    savePaymentSchedules,
    payScheduledInstallment,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    resetOrderForm
  } = useOrders();

  const { clients } = useClients();
  const { farms } = useFarms();

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleEdit = (order: Order) => {
    if (order.status !== "Pendente") {
      toast({
        title: "Pedido Bloqueado para Edição",
        description: "Depois de aprovado, o pedido não pode ser editado.",
        variant: "destructive",
      });
      return;
    }
    setEditingOrder(order);
    setFormData(order);
    setShowOrderForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || formData.clientId.trim() === '') {
      toast({
        title: "Cliente obrigatório",
        description: "Por favor, selecione um cliente para o pedido.",
        variant: "destructive"
      });
      return;
    }

    const isProductOrder = formData.type === "Produto";

    if (isProductOrder) {
      if (
        !formData.productsData ||
        !Array.isArray(formData.productsData) ||
        !formData.productsData.some((p: any) => p.id && Number(p.quantity) > 0)
      ) {
        toast({
          title: "Produtos obrigatórios",
          description: "Por favor, adicione pelo menos um produto com quantidade maior que zero.",
          variant: "destructive"
        });
        return;
      }
      if (!formData.area) {
        formData.area = "0";
      }
      if (!formData.serviceName) {
        formData.serviceName = "Venda de Produtos";
      }
    } else {
      const numArea = parseFloat(formData.area || "0");
      if (!formData.area || isNaN(numArea) || numArea <= 0) {
        toast({
          title: "Área obrigatória",
          description: "Por favor, informe uma área válida (em hectares ou alqueires) maior que zero para o pedido de serviço.",
          variant: "destructive"
        });
        return;
      }
    }

    const result = editingOrder
      ? await updateOrder(formData)
      : await addOrder(formData);
    if (result) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      clientId: "",
      farmId: "",
      type: "Serviço",
      serviceName: "",
      productsData: [],
      serviceGroup: "",
      area: "",
      value: "",
      numericValue: 0,
      status: "Pendente",
      payment: "Aguardando",
      executions: [],
      schedules: [],
      payments: [],
      executedArea: 0,
      paidAmount: 0
    });
    setEditingOrder(null);
    setShowOrderForm(false);
  };

  const handleInputChange = (field: keyof Order, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const clientName = order.client?.name || clients.find(c => c.id === order.clientId)?.name || "";
    const farmName = order.farm?.name || farms.find(f => f.id === order.farmId)?.name || "";
    const serviceName = order.serviceName || order.type || "";

    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = serviceFilter === "all" || serviceName === serviceFilter || order.type === serviceFilter;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

  const serviceOptions = useMemo(() => {
    const names = new Set<string>();
    orders.forEach((o) => {
      const n = o.serviceName || o.type;
      if (n) names.add(n);
    });
    return Array.from(names).sort();
  }, [orders]);

  const kpiStats = useMemo(() => {
    const pendentes = orders.filter((o) => o.status === "Pendente").length;
    const emAndamento = orders.filter((o) => o.status === "Em Andamento" || o.status === "Aprovado").length;
    const concluidos = orders.filter((o) => o.status === "Concluído").length;
    const totalValorFiltrado = filteredOrders
      .filter((o) => o.status !== "Cancelado")
      .reduce((acc, o) => acc + (Number(o.numericValue) || 0), 0);
    return { pendentes, emAndamento, concluidos, totalValorFiltrado };
  }, [orders, filteredOrders]);

  const hasActiveFilters = searchTerm.trim() !== "" || serviceFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie orçamentos, aprovações, execuções e pagamentos de serviços</p>
        </div>
        <Button onClick={() => { resetOrderForm(); setShowOrderForm(true); }} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Mini-KPIs Clicáveis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          onClick={() => setStatusFilter(statusFilter === "Pendente" ? "all" : "Pendente")}
          className={`cursor-pointer transition-all hover:shadow-sm ${statusFilter === "Pendente" ? "ring-2 ring-amber-400 bg-amber-50/40" : ""}`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Aguardando Aprovação</p>
              <p className="text-2xl font-bold text-amber-700">{kpiStats.pendentes}</p>
            </div>
            <Clock className="h-7 w-7 text-amber-500/70" />
          </CardContent>
        </Card>
        <Card
          onClick={() => setStatusFilter(statusFilter === "Em Andamento" ? "all" : "Em Andamento")}
          className={`cursor-pointer transition-all hover:shadow-sm ${statusFilter === "Em Andamento" ? "ring-2 ring-blue-400 bg-blue-50/40" : ""}`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Aprovados / Em Campo</p>
              <p className="text-2xl font-bold text-blue-700">{kpiStats.emAndamento}</p>
            </div>
            <Play className="h-7 w-7 text-blue-500/70" />
          </CardContent>
        </Card>
        <Card
          onClick={() => setStatusFilter(statusFilter === "Concluído" ? "all" : "Concluído")}
          className={`cursor-pointer transition-all hover:shadow-sm ${statusFilter === "Concluído" ? "ring-2 ring-emerald-400 bg-emerald-50/40" : ""}`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Concluídos</p>
              <p className="text-2xl font-bold text-emerald-700">{kpiStats.concluidos}</p>
            </div>
            <CheckCircle2 className="h-7 w-7 text-emerald-500/70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Volume Filtrado</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpiStats.totalValorFiltrado)}
              </p>
            </div>
            <DollarSign className="h-7 w-7 text-green-600/70 shrink-0" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <CardTitle>Lista de Pedidos</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mostrando <strong>{filteredOrders.length}</strong> de <strong>{orders.length}</strong> pedidos
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, fazenda ou serviço..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-8 w-full sm:w-60"
                />
              </div>

              <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Serviços</SelectItem>
                  {serviceOptions.map((srv) => (
                    <SelectItem key={srv} value={srv}>{srv}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setServiceFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-muted-foreground gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <OrdersTable
            orders={filteredOrders}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onEdit={handleEdit}
            onApprove={approveOrder}
            onCancel={cancelOrder}
            onRecordExecution={recordExecution}
            onAddSchedule={addSchedule}
            onRecordPayment={recordPayment}
            onSavePaymentSchedules={savePaymentSchedules}
            onPayScheduledInstallment={payScheduledInstallment}
          />
        </CardContent>
      </Card>

      <OrderForm
        open={showOrderForm}
        onOpenChange={(open) => { if (!open) resetOrderForm(); setShowOrderForm(open); }}
        editingOrder={editingOrder}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => { resetOrderForm(); setShowOrderForm(false); }}
      />
    </div>
  );
};

export default OrdersPage;

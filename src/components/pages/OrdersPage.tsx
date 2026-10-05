import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { OrdersTable } from "./orders/OrdersTable";
import { OrderForm } from "./orders/OrderForm";
import { useOrders, Order } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useFarms } from "@/hooks/useFarms";

const OrdersPage = () => {
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
    setEditingOrder(order);
    setFormData(order);
    setShowOrderForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      await updateOrder(formData);
    } else {
      await addOrder(formData);
    }
    resetForm();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie orçamentos, aprovações, execuções e pagamentos de serviços</p>
        </div>
        <Button onClick={() => { resetOrderForm(); setShowOrderForm(true); }} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Lista de Pedidos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, fazenda ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
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

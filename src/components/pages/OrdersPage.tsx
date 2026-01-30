import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrdersTable } from "./orders/OrdersTable";
import { OrderForm } from "./orders/OrderForm";
import { useOrders, Order } from "@/hooks/useOrders";
import { useClients, Client } from "@/hooks/useClients";
import { useFarms, Farm, Plot } from "@/hooks/useFarms";

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
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
  } = useOrders();

  const { clients } = useClients();
  const { farms } = useFarms();

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");
  const [availableFarms, setAvailableFarms] = useState<Farm[]>([]);
  const [availablePlots, setAvailablePlots] = useState<Plot[]>([]);

  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => c.id === formData.clientId);
      // The owner of a farm is a client's name, not id. So we need to find the client name first.
      if (client) {
        setAvailableFarms(farms.filter(farm => farm.owner === client.name));
      } else {
        setAvailableFarms([]);
      }
    } else {
      setAvailableFarms([]);
    }
  }, [formData.clientId, clients, farms]);

  useEffect(() => {
    if (formData.farmId) {
      const farm = farms.find(f => f.id === formData.farmId);
      if (farm) {
        setAvailablePlots(farm.plots || []);
      } else {
        setAvailablePlots([]);
      }
    } else {
      setAvailablePlots([]);
    }
  }, [formData.farmId, farms]);

  const handleEdit = (order: Order) => {
    console.log("Editing order:", order);
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
      status: "Pendente",
      payment: "Aguardando"
    });
    setEditingOrder(null);
    setShowOrderForm(false);
  };

  const handleInputChange = (field: keyof Order, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const availableServices = ["Pulverização", "Plantio", "Colheita", "Adubação"];
  const cidadesEstados = Array.from(new Set(farms.map(f => `${f.city} - ${f.state}`))).sort();

  const filteredOrders = orders.filter(order => {
    const clientName = clients.find(c => c.id === order.clientId)?.name || "";
    const farmName = farms.find(f => f.id === order.farmId)?.name || "";

    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = !serviceFilter || serviceFilter === "all" || order.serviceName === serviceFilter || order.serviceGroup === serviceFilter;
    
    const farm = farms.find(f => f.id === order.farmId);
    const farmLocation = farm ? `${farm.city} - ${farm.state}` : "";
    const matchesCidadeEstado = !cidadeEstadoFilter || cidadeEstadoFilter === "all" || farmLocation === cidadeEstadoFilter;
    
    return matchesSearch && matchesService && matchesCidadeEstado;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos de serviços</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowOrderForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Pedidos</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar pedido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {availableServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cidadeEstadoFilter} onValueChange={setCidadeEstadoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Cidade/Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cidadesEstados.map((cidadeEstado) => (
                    <SelectItem key={cidadeEstado} value={cidadeEstado}>
                      {cidadeEstado}
                    </SelectItem>
                  ))}
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
          />
        </CardContent>
      </Card>

      <OrderForm
        open={showOrderForm}
        onOpenChange={setShowOrderForm}
        editingOrder={editingOrder}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        clients={clients}
        farms={farms}
        availableFarms={availableFarms}
        availablePlots={availablePlots}
      />
    </div>
  );
};

export default OrdersPage;

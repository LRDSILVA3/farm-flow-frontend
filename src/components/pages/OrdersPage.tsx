import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrdersTable } from "./orders/OrdersTable";
import { OrderForm } from "./orders/OrderForm";
import { useOrders, Order } from "@/hooks/useOrders";

export interface Pedido {
  id: string;
  cliente: string;
  fazenda: string;
  tipo: string;
  servico: string;
  produtos: { id: string; nome: string; quantidade: number }[];
  grupoServico: string;
  area: string;
  valor: string;
  status: string;
  pagamento: string;
}

// Map between English and Portuguese
const mapOrderToPedido = (order: Order): Pedido => ({
  id: order.id,
  cliente: order.clientId,
  fazenda: order.farmId,
  tipo: order.type,
  servico: order.serviceName,
  produtos: order.productsData,
  grupoServico: order.serviceGroup,
  area: order.area,
  valor: order.value,
  status: order.status,
  pagamento: order.payment
});

const mapPedidoToOrder = (pedido: Pedido): Order => ({
  id: pedido.id,
  clientId: pedido.cliente,
  farmId: pedido.fazenda,
  type: pedido.tipo,
  serviceName: pedido.servico,
  productsData: pedido.produtos,
  serviceGroup: pedido.grupoServico,
  area: pedido.area,
  value: pedido.valor,
  status: pedido.status,
  payment: pedido.pagamento
});

const PedidosPage = () => {
  const { toast } = useToast();
  const orderHook = useOrders();
  
  const pedidos = orderHook.orders.map(mapOrderToPedido);
  const showPedidoForm = orderHook.showOrderForm;
  const setShowPedidoForm = orderHook.setShowOrderForm;
  const editingPedido = orderHook.editingOrder ? mapOrderToPedido(orderHook.editingOrder) : null;
  const setEditingPedido = (p: Pedido | null) => orderHook.setEditingOrder(p ? mapPedidoToOrder(p) : null);
  const formData = mapOrderToPedido(orderHook.formData);
  const setFormData = (p: Pedido) => orderHook.setFormData(mapPedidoToOrder(p));

  const [searchTerm, setSearchTerm] = useState("");
  const [servicoFilter, setServicoFilter] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");

  const handleEdit = (pedido: Pedido) => {
    console.log("Editando pedido:", pedido);
    setEditingPedido(pedido);
    setFormData(pedido);
    setShowPedidoForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPedido) {
      await orderHook.updateOrder(mapPedidoToOrder(formData));
    } else {
      await orderHook.addOrder(mapPedidoToOrder(formData));
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      cliente: "",
      fazenda: "",
      tipo: "Serviço",
      servico: "",
      produtos: [],
      grupoServico: "",
      area: "",
      valor: "",
      status: "Pendente",
      pagamento: "Aguardando"
    });
    setEditingPedido(null);
    setShowPedidoForm(false);
  };

  const handleInputChange = (field: keyof Pedido, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const servicosDisponiveis = ["Pulverização", "Plantio", "Colheita", "Adubação"];
  const cidadesEstados = ["Interior SP", "Interior MG", "Interior GO"];

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.fazenda.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesServico = !servicoFilter || servicoFilter === "all" || pedido.servico === servicoFilter || pedido.grupoServico === servicoFilter;
    const matchesCidadeEstado = !cidadeEstadoFilter || cidadeEstadoFilter === "all";
    
    return matchesSearch && matchesServico && matchesCidadeEstado;
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
          onClick={() => setShowPedidoForm(true)}
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
              <Select value={servicoFilter} onValueChange={setServicoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {servicosDisponiveis.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
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
            pedidos={filteredPedidos}
            currentPage={orderHook.currentPage}
            itemsPerPage={orderHook.itemsPerPage}
            onPageChange={orderHook.setCurrentPage}
            onItemsPerPageChange={orderHook.setItemsPerPage}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <OrderForm
        open={showPedidoForm}
        onOpenChange={setShowPedidoForm}
        editingPedido={editingPedido}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />
    </div>
  );
};

export default PedidosPage;

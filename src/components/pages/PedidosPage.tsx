
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PedidosTable } from "./pedidos/PedidosTable";
import { PedidoForm } from "./pedidos/PedidoForm";
import { usePedidos } from "./pedidos/usePedidos";

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

const PedidosPage = () => {
  const { toast } = useToast();
  const {
    pedidos,
    setPedidos,
    showPedidoForm,
    setShowPedidoForm,
    editingPedido,
    setEditingPedido,
    formData,
    setFormData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
  } = usePedidos();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [servicoFilter, setServicoFilter] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");

  const handleEdit = (pedido: Pedido) => {
    console.log("Editando pedido:", pedido);
    setEditingPedido(pedido);
    setFormData(pedido);
    setShowPedidoForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPedido) {
      // Atualizar pedido existente
      setPedidos(prev => prev.map(p => p.id === editingPedido.id ? formData : p));
      toast({
        title: "Pedido atualizado",
        description: "O pedido foi atualizado com sucesso.",
      });
    } else {
      // Criar novo pedido
      const newPedido = { ...formData, id: Date.now().toString() };
      setPedidos(prev => [...prev, newPedido]);
      toast({
        title: "Pedido criado",
        description: "O pedido foi criado com sucesso.",
      });
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Listas para filtros
  const servicosDisponiveis = ["Pulverização", "Plantio", "Colheita", "Adubação"];
  const cidadesEstados = ["Interior SP", "Interior MG", "Interior GO"]; // Mock data

  // Filtrar pedidos baseado nos critérios de busca
  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.fazenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pedido.cliente && pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesServico = !servicoFilter || pedido.servico === servicoFilter || pedido.grupoServico === servicoFilter;
    const matchesCidadeEstado = !cidadeEstadoFilter; // Seria implementado com dados reais das fazendas
    
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
                  <SelectItem value="">Todos os serviços</SelectItem>
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
                  <SelectItem value="">Todas as cidades</SelectItem>
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
          <PedidosTable
            pedidos={filteredPedidos}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <PedidoForm
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

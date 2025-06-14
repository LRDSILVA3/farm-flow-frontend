
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PedidosTable } from "./pedidos/PedidosTable";
import { PedidoForm } from "./pedidos/PedidoForm";
import { usePedidos } from "./pedidos/usePedidos";

export interface Pedido {
  id: string;
  cliente: string;
  fazenda: string;
  servico: string;
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
      servico: "",
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
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <PedidosTable
            pedidos={pedidos}
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

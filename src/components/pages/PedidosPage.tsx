
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pedido {
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
  
  // Lista de serviços disponíveis (vinda das configurações)
  const servicosDisponiveis = [
    { id: "1", nome: "Pulverização", valorAlqueire: "200.00", status: "Ativo" },
    { id: "2", nome: "Plantio", valorAlqueire: "150.00", status: "Ativo" },
    { id: "3", nome: "Colheita", valorAlqueire: "180.00", status: "Ativo" },
    { id: "4", nome: "Adubação", valorAlqueire: "120.00", status: "Ativo" }
  ];

  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: "1",
      cliente: "João Silva",
      fazenda: "Fazenda São João",
      servico: "Pulverização",
      area: "45.5",
      valor: "R$ 9.100,00",
      status: "Pendente",
      pagamento: "Aguardando"
    }
  ]);

  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [formData, setFormData] = useState<Pedido>({
    id: "",
    cliente: "",
    fazenda: "",
    servico: "",
    area: "",
    valor: "",
    status: "Pendente",
    pagamento: "Aguardando"
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-100 text-green-800";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPagamentoColor = (pagamento: string) => {
    switch (pagamento) {
      case "Pago":
        return "bg-green-100 text-green-800";
      case "Parcial":
        return "bg-yellow-100 text-yellow-800";
      case "Aguardando":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Área (ha)</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{pedido.fazenda}</TableCell>
                  <TableCell>{pedido.servico}</TableCell>
                  <TableCell>{pedido.area}</TableCell>
                  <TableCell>{pedido.valor}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(pedido.status)}`}>
                      {pedido.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPagamentoColor(pedido.pagamento)}`}>
                      {pedido.pagamento}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(pedido)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showPedidoForm} onOpenChange={setShowPedidoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPedido ? "Editar Pedido" : "Novo Pedido"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => handleInputChange("cliente", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fazenda">Fazenda</Label>
                <Input
                  id="fazenda"
                  value={formData.fazenda}
                  onChange={(e) => handleInputChange("fazenda", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servico">Serviço</Label>
                <Select value={formData.servico} onValueChange={(value) => handleInputChange("servico", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicosDisponiveis
                      .filter(servico => servico.status === "Ativo")
                      .map((servico) => (
                        <SelectItem key={servico.id} value={servico.nome}>
                          {servico.nome} - R$ {servico.valorAlqueire}/alqueire
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="area">Área (ha)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  value={formData.valor}
                  onChange={(e) => handleInputChange("valor", e.target.value)}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="pagamento">Pagamento</Label>
              <Select value={formData.pagamento} onValueChange={(value) => handleInputChange("pagamento", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aguardando">Aguardando</SelectItem>
                  <SelectItem value="Parcial">Parcial</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingPedido ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PedidosPage;

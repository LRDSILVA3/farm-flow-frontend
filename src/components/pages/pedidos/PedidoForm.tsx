
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Pedido } from "../PedidosPage";

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPedido: Pedido | null;
  formData: Pedido;
  onInputChange: (field: keyof Pedido, value: string | { id: string; nome: string; quantidade: number }[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PedidoForm = ({
  open,
  onOpenChange,
  editingPedido,
  formData,
  onInputChange,
  onSubmit,
  onCancel
}: PedidoFormProps) => {
  // Lista de serviços disponíveis
  const servicosDisponiveis = [
    { id: "1", nome: "Pulverização", valorAlqueire: "200.00", status: "Ativo" },
    { id: "2", nome: "Plantio", valorAlqueire: "150.00", status: "Ativo" },
    { id: "3", nome: "Colheita", valorAlqueire: "180.00", status: "Ativo" },
    { id: "4", nome: "Adubação", valorAlqueire: "120.00", status: "Ativo" }
  ];

  // Lista de produtos disponíveis
  const produtosDisponiveis = [
    { id: "1", nome: "Defensivo A", valorUn: "45.00" },
    { id: "2", nome: "Sementes Milho", valorUn: "120.00" },
    { id: "3", nome: "Fertilizante NPK", valorUn: "80.00" },
    { id: "4", nome: "Herbicida", valorUn: "65.00" }
  ];

  // Lista de grupos de serviços disponíveis
  const gruposServicosDisponiveis = [
    { id: "1", nome: "Pacote Completo", descricao: "Pulverização + Plantio + Colheita" },
    { id: "2", nome: "Pacote Básico", descricao: "Pulverização + Adubação" }
  ];

  const adicionarProduto = () => {
    const novosProdutos = [...formData.produtos, { id: "", nome: "", quantidade: 1 }];
    onInputChange("produtos", novosProdutos);
  };

  const removerProduto = (index: number) => {
    const novosProdutos = formData.produtos.filter((_, i) => i !== index);
    onInputChange("produtos", novosProdutos);
  };

  const atualizarProduto = (index: number, campo: string, valor: string | number) => {
    const novosProdutos = [...formData.produtos];
    novosProdutos[index] = { ...novosProdutos[index], [campo]: valor };
    onInputChange("produtos", novosProdutos);
  };

  const renderCamposPorTipo = () => {
    switch (formData.tipo) {
      case "Produto":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Produtos</Label>
              <Button type="button" size="sm" onClick={adicionarProduto}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            {formData.produtos.map((produto, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <Label>Produto</Label>
                  <Select 
                    value={produto.id} 
                    onValueChange={(value) => {
                      const produtoSelecionado = produtosDisponiveis.find(p => p.id === value);
                      atualizarProduto(index, "id", value);
                      atualizarProduto(index, "nome", produtoSelecionado?.nome || "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtosDisponiveis.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} - R$ {produto.valorUn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={produto.quantidade}
                    onChange={(e) => atualizarProduto(index, "quantidade", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div></div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removerProduto(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        );

      case "Serviço":
        return (
          <div>
            <Label htmlFor="servico">Serviço</Label>
            <Select value={formData.servico} onValueChange={(value) => onInputChange("servico", value)}>
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
        );

      case "Grupo de Serviços":
        return (
          <div>
            <Label htmlFor="grupoServico">Grupo de Serviços</Label>
            <Select value={formData.grupoServico} onValueChange={(value) => onInputChange("grupoServico", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                {gruposServicosDisponiveis.map((grupo) => (
                  <SelectItem key={grupo.id} value={grupo.nome}>
                    {grupo.nome} - {grupo.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPedido ? "Editar Pedido" : "Novo Pedido"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => onInputChange("cliente", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="fazenda">Fazenda</Label>
              <Input
                id="fazenda"
                value={formData.fazenda}
                onChange={(e) => onInputChange("fazenda", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={formData.tipo} onValueChange={(value) => onInputChange("tipo", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Produto">Produto</SelectItem>
                <SelectItem value="Serviço">Serviço</SelectItem>
                <SelectItem value="Grupo de Serviços">Grupo de Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderCamposPorTipo()}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Área (ha)</Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                value={formData.area}
                onChange={(e) => onInputChange("area", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                value={formData.valor}
                onChange={(e) => onInputChange("valor", e.target.value)}
                placeholder="R$ 0,00"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => onInputChange("status", value)}>
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
            <div>
              <Label htmlFor="pagamento">Pagamento</Label>
              <Select value={formData.pagamento} onValueChange={(value) => onInputChange("pagamento", value)}>
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
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingPedido ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pedido } from "../PedidosPage";

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPedido: Pedido | null;
  formData: Pedido;
  onInputChange: (field: keyof Pedido, value: string) => void;
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
  // Lista de serviços disponíveis (vinda das configurações)
  const servicosDisponiveis = [
    { id: "1", nome: "Pulverização", valorAlqueire: "200.00", status: "Ativo" },
    { id: "2", nome: "Plantio", valorAlqueire: "150.00", status: "Ativo" },
    { id: "3", nome: "Colheita", valorAlqueire: "180.00", status: "Ativo" },
    { id: "4", nome: "Adubação", valorAlqueire: "120.00", status: "Ativo" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Servico } from "./useServicos";

interface ServicoModalProps {
  showServicoForm: boolean;
  setShowServicoForm: (value: boolean) => void;
  editingServico: Servico | null;
  servicoFormData: Servico;
  handleServicoSubmit: (e: React.FormEvent) => void;
  resetServicoForm: () => void;
  handleServicoInputChange: (field: keyof Servico, value: string) => void;
}

export const ServicoModal: React.FC<ServicoModalProps> = ({
  showServicoForm,
  setShowServicoForm,
  editingServico,
  servicoFormData,
  handleServicoSubmit,
  resetServicoForm,
  handleServicoInputChange
}) => {
  return (
    <Dialog open={showServicoForm} onOpenChange={setShowServicoForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingServico ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleServicoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Serviço</Label>
              <Input
                id="nome"
                value={servicoFormData.nome}
                onChange={(e) => handleServicoInputChange("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="valorAlqueire">Valor por Alqueire</Label>
              <Input
                id="valorAlqueire"
                type="number"
                step="0.01"
                value={servicoFormData.valorAlqueire}
                onChange={(e) => handleServicoInputChange("valorAlqueire", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={servicoFormData.status} onValueChange={(value) => handleServicoInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="produtos">Produtos Utilizados</Label>
              <Input
                id="produtos"
                value={servicoFormData.produtos}
                onChange={(e) => handleServicoInputChange("produtos", e.target.value)}
                placeholder="Ex: Defensivo A, Sementes"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetServicoForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingServico ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

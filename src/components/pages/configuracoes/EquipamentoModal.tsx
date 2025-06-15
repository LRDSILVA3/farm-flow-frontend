
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Equipamento } from "./useEquipamentos";

interface EquipamentoModalProps {
  showEquipamentoForm: boolean;
  setShowEquipamentoForm: (value: boolean) => void;
  editingEquipamento: Equipamento | null;
  equipamentoFormData: Equipamento;
  handleEquipamentoSubmit: (e: React.FormEvent) => void;
  resetEquipamentoForm: () => void;
  handleEquipamentoInputChange: (field: keyof Equipamento, value: string) => void;
}

export const EquipamentoModal: React.FC<EquipamentoModalProps> = ({
  showEquipamentoForm,
  setShowEquipamentoForm,
  editingEquipamento,
  equipamentoFormData,
  handleEquipamentoSubmit,
  resetEquipamentoForm,
  handleEquipamentoInputChange
}) => {
  return (
    <Dialog open={showEquipamentoForm} onOpenChange={setShowEquipamentoForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingEquipamento ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEquipamentoSubmit} className="space-y-4">
          <div>
            <Label htmlFor="equipamentoNome">Nome do Equipamento</Label>
            <Input
              id="equipamentoNome"
              value={equipamentoFormData.nome}
              onChange={(e) => handleEquipamentoInputChange("nome", e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="equipamentoStatus">Status</Label>
            <Select value={equipamentoFormData.status} onValueChange={(value) => handleEquipamentoInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                <SelectItem value="Em Uso">Em Uso</SelectItem>
                <SelectItem value="Indisponível">Indisponível</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetEquipamentoForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingEquipamento ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

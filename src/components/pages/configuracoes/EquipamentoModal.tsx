
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Equipment } from "./../../../hooks/useEquipment";

interface EquipmentModalProps {
  showEquipmentForm: boolean;
  setShowEquipmentForm: (value: boolean) => void;
  editingEquipment: Equipment | null;
  equipmentFormData: Equipment;
  handleEquipmentSubmit: (e: React.FormEvent) => void;
  resetEquipmentForm: () => void;
  handleEquipmentInputChange: (field: keyof Equipment, value: string) => void;
}

export const EquipamentoModal: React.FC<EquipmentModalProps> = ({
  showEquipmentForm,
  setShowEquipmentForm,
  editingEquipment,
  equipmentFormData,
  handleEquipmentSubmit,
  resetEquipmentForm,
  handleEquipmentInputChange
}) => {
  return (
    <Dialog open={showEquipmentForm} onOpenChange={setShowEquipmentForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingEquipment ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEquipmentSubmit} className="space-y-4">
          <div>
            <Label htmlFor="equipamentoNome">Nome do Equipamento</Label>
            <Input
              id="equipamentoNome"
              value={equipmentFormData.name}
              onChange={(e) => handleEquipmentInputChange("name", e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="equipamentoStatus">Status</Label>
            <Select value={equipmentFormData.status} onValueChange={(value) => handleEquipmentInputChange("status", value)}>
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
            <Button type="button" variant="outline" onClick={resetEquipmentForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingEquipment ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Wrench, Package } from "lucide-react";
import { Equipment } from "../../../hooks/useEquipment";

interface EquipmentModalProps {
  showEquipmentForm: boolean;
  setShowEquipmentForm: (value: boolean) => void;
  editingEquipment: Equipment | null;
  equipmentFormData: Equipment;
  handleEquipmentSubmit: (e: React.FormEvent) => void;
  resetEquipmentForm: () => void;
  handleEquipmentInputChange: (field: keyof Equipment, value: string) => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  showEquipmentForm,
  setShowEquipmentForm,
  editingEquipment,
  equipmentFormData,
  handleEquipmentSubmit,
  resetEquipmentForm,
  handleEquipmentInputChange
}) => {
  const currentType = equipmentFormData.type || "Veículo";

  return (
    <Dialog open={showEquipmentForm} onOpenChange={setShowEquipmentForm}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentType === "Veículo" && <Truck className="h-5 w-5 text-blue-600" />}
            {currentType === "Ferramenta" && <Wrench className="h-5 w-5 text-purple-600" />}
            {currentType === "Outro" && <Package className="h-5 w-5 text-amber-600" />}
            {editingEquipment ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEquipmentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipamentoNome">Nome / Identificação *</Label>
              <Input
                id="equipamentoNome"
                placeholder="Ex: Hilux Prata, Drone DJI Agras T40, Quadriciclo"
                value={equipmentFormData.name}
                onChange={(e) => handleEquipmentInputChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="equipamentoTipo">Tipo de Equipamento</Label>
              <Select 
                value={equipmentFormData.type || "Veículo"} 
                onValueChange={(value) => handleEquipmentInputChange("type", value)}
              >
                <SelectTrigger id="equipamentoTipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Veículo">Veículo (Carro, Caminhonete, Caminhão, Quadriciclo)</SelectItem>
                  <SelectItem value="Ferramenta">Ferramenta / Maquinário (Drone, Penetômetro, Trator, GPS)</SelectItem>
                  <SelectItem value="Outro">Outro (Acessório, Equipamento de Apoio)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipamentoStatus">Status Operacional</Label>
              <Select value={equipmentFormData.status} onValueChange={(value) => handleEquipmentInputChange("status", value)}>
                <SelectTrigger id="equipamentoStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Em Uso">Em Uso / Em Campo</SelectItem>
                  <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                  <SelectItem value="Indisponível">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="equipamentoModelo">Modelo / Marca</Label>
              <Input
                id="equipamentoModelo"
                placeholder="Ex: Toyota Hilux SRX, DJI T40"
                value={equipmentFormData.model || ""}
                onChange={(e) => handleEquipmentInputChange("model", e.target.value)}
              />
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS PARA VEÍCULO */}
          {currentType === "Veículo" && (
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3">
              <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                Dados do Veículo (Opcionais)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="equipamentoPlaca" className="text-xs">Placa do Veículo</Label>
                  <Input
                    id="equipamentoPlaca"
                    placeholder="Ex: ABC-1D23"
                    value={equipmentFormData.plate || ""}
                    onChange={(e) => handleEquipmentInputChange("plate", e.target.value.toUpperCase())}
                    className="h-8 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="equipamentoAno" className="text-xs">Ano Fabricação</Label>
                  <Input
                    id="equipamentoAno"
                    placeholder="Ex: 2023"
                    value={equipmentFormData.year || ""}
                    onChange={(e) => handleEquipmentInputChange("year", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="equipamentoKm" className="text-xs">Km Atual / Horímetro</Label>
                  <Input
                    id="equipamentoKm"
                    placeholder="Ex: 45.000 km"
                    value={equipmentFormData.hourmeter || ""}
                    onChange={(e) => handleEquipmentInputChange("hourmeter", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS PARA FERRAMENTA */}
          {currentType === "Ferramenta" && (
            <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg space-y-3">
              <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                Dados da Ferramenta / Maquinário (Opcionais)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="equipamentoSerial" className="text-xs">Número de Série</Label>
                  <Input
                    id="equipamentoSerial"
                    placeholder="Ex: SN-987654321"
                    value={equipmentFormData.serialNumber || ""}
                    onChange={(e) => handleEquipmentInputChange("serialNumber", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="equipamentoHorimetro" className="text-xs">Horímetro / Horas de Voo</Label>
                  <Input
                    id="equipamentoHorimetro"
                    placeholder="Ex: 120 horas"
                    value={equipmentFormData.hourmeter || ""}
                    onChange={(e) => handleEquipmentInputChange("hourmeter", e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS PARA OUTROS OU OBSERVAÇÕES GERAIS */}
          <div>
            <Label htmlFor="equipamentoNotas">Observações Adicionais</Label>
            <Textarea
              id="equipamentoNotas"
              placeholder="Histórico de manutenções, acessórios vinculados ou observações de campo..."
              value={equipmentFormData.notes || ""}
              onChange={(e) => handleEquipmentInputChange("notes", e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={resetEquipmentForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingEquipment ? "Atualizar Equipamento" : "Salvar Equipamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
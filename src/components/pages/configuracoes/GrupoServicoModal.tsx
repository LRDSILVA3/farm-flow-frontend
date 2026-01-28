
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceGroup } from "./../../../hooks/useServiceGroups";

interface GrupoServicoModalProps {
  showGrupoServicoForm: boolean;
  setShowGrupoServicoForm: (value: boolean) => void;
  editingGrupoServico: ServiceGroup | null;
  grupoServicoFormData: ServiceGroup;
  handleGrupoServicoSubmit: (e: React.FormEvent) => void;
  resetGrupoServicoForm: () => void;
  handleGrupoServicoInputChange: (field: keyof ServiceGroup, value: string | string[]) => void;
}

export const GrupoServicoModal: React.FC<GrupoServicoModalProps> = ({
  showGrupoServicoForm,
  setShowGrupoServicoForm,
  editingGrupoServico,
  grupoServicoFormData,
  handleGrupoServicoSubmit,
  resetGrupoServicoForm,
  handleGrupoServicoInputChange
}) => {
  // Lista de serviços disponíveis
  const servicosDisponiveis = [
    { id: "1", nome: "Pulverização" },
    { id: "2", nome: "Plantio" },
    { id: "3", nome: "Colheita" },
    { id: "4", nome: "Adubação" }
  ];

  const handleServicoChange = (servicoId: string, checked: boolean) => {
    if (checked) {
      handleGrupoServicoInputChange("servicesIds", [...grupoServicoFormData.servicesIds, servicoId]);
    } else {
      handleGrupoServicoInputChange("servicesIds", grupoServicoFormData.servicesIds.filter(id => id !== servicoId));
    }
  };

  return (
    <Dialog open={showGrupoServicoForm} onOpenChange={setShowGrupoServicoForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingGrupoServico ? "Editar Grupo de Serviço" : "Novo Grupo de Serviço"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleGrupoServicoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Grupo</Label>
              <Input
                id="nome"
                value={grupoServicoFormData.name}
                onChange={(e) => handleGrupoServicoInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={grupoServicoFormData.status} onValueChange={(value) => handleGrupoServicoInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={grupoServicoFormData.description}
              onChange={(e) => handleGrupoServicoInputChange("description", e.target.value)}
              placeholder="Ex: Pacote completo de serviços"
            />
          </div>

          <div>
            <Label>Serviços Inclusos</Label>
            <div className="space-y-2 mt-2">
              {servicosDisponiveis.map((servico) => (
                <div key={servico.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`servico-${servico.id}`}
                    checked={grupoServicoFormData.servicesIds.includes(servico.id)}
                    onCheckedChange={(checked) => handleServicoChange(servico.id, checked as boolean)}
                  />
                  <Label htmlFor={`servico-${servico.id}`}>{servico.nome}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetGrupoServicoForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingGrupoServico ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

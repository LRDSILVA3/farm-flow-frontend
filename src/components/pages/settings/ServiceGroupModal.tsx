
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceGroup } from "../../../hooks/useServiceGroups";

interface ServiceGroupModalProps {
  showServiceGroupForm: boolean;
  setShowServiceGroupForm: (value: boolean) => void;
  editingServiceGroup: ServiceGroup | null;
  serviceGroupFormData: ServiceGroup;
  handleServiceGroupSubmit: (e: React.FormEvent) => void;
  resetServiceGroupForm: () => void;
  handleServiceGroupInputChange: (field: keyof ServiceGroup, value: string | string[]) => void;
}

export const ServiceGroupModal: React.FC<ServiceGroupModalProps> = ({
  showServiceGroupForm,
  setShowServiceGroupForm,
  editingServiceGroup,
  serviceGroupFormData,
  handleServiceGroupSubmit,
  resetServiceGroupForm,
  handleServiceGroupInputChange
}) => {
  // Lista de serviços disponíveis
  const availableServices = [
    { id: "1", name: "Pulverização" },
    { id: "2", name: "Plantio" },
    { id: "3", name: "Colheita" },
    { id: "4", name: "Adubação" }
  ];

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      handleServiceGroupInputChange("servicesIds", [...serviceGroupFormData.servicesIds, serviceId]);
    } else {
      handleServiceGroupInputChange("servicesIds", serviceGroupFormData.servicesIds.filter(id => id !== serviceId));
    }
  };

  return (
    <Dialog open={showServiceGroupForm} onOpenChange={setShowServiceGroupForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingServiceGroup ? "Editar Grupo de Serviço" : "Novo Grupo de Serviço"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleServiceGroupSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Grupo</Label>
              <Input
                id="name"
                value={serviceGroupFormData.name}
                onChange={(e) => handleServiceGroupInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={serviceGroupFormData.status} onValueChange={(value) => handleServiceGroupInputChange("status", value)}>
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
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={serviceGroupFormData.description}
              onChange={(e) => handleServiceGroupInputChange("description", e.target.value)}
              placeholder="Ex: Pacote completo de serviços"
            />
          </div>

          <div>
            <Label>Serviços Inclusos</Label>
            <div className="space-y-2 mt-2">
              {availableServices.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={serviceGroupFormData.servicesIds.includes(service.id)}
                    onCheckedChange={(checked) => handleServiceChange(service.id, checked as boolean)}
                  />
                  <Label htmlFor={`service-${service.id}`}>{service.name}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetServiceGroupForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingServiceGroup ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

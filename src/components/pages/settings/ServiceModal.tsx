
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Service } from "../../../hooks/useServices";

interface ServiceModalProps {
  showServiceForm: boolean;
  setShowServiceForm: (value: boolean) => void;
  editingService: Service | null;
  serviceFormData: Service;
  handleServiceSubmit: (e: React.FormEvent) => void;
  resetServiceForm: () => void;
  handleServiceInputChange: (field: keyof Service, value: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  showServiceForm,
  setShowServiceForm,
  editingService,
  serviceFormData,
  handleServiceSubmit,
  resetServiceForm,
  handleServiceInputChange
}) => {
  return (
    <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingService ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleServiceSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Serviço</Label>
              <Input
                id="nome"
                value={serviceFormData.name}
                onChange={(e) => handleServiceInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="valorAlqueire">Valor por Alqueire</Label>
              <Input
                id="valorAlqueire"
                type="number"
                step="0.01"
                value={serviceFormData.valuePerAlqueire}
                onChange={(e) => handleServiceInputChange("valuePerAlqueire", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={serviceFormData.status} onValueChange={(value) => handleServiceInputChange("status", value)}>
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
                value={serviceFormData.products}
                onChange={(e) => handleServiceInputChange("products", e.target.value)}
                placeholder="Ex: Defensivo A, Sementes"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetServiceForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingService ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plan } from "./usePlan";
import { FormEvent } from "react";

interface PlanModalProps {
  services: { id: number; name: string }[];
  showPlanForm: boolean;
  setShowPlanForm: (show: boolean) => void;
  editingPlan: Plan | null;
  planFormData: Plan;
  handlePlanSubmit: (e: FormEvent) => void;
  resetPlanForm: () => void;
  handlePlanInputChange: (field: keyof Plan, value: string | number | number[]) => void;
  handleServiceToggle: (serviceId: number) => void;
}

export const PlanModal = ({
  services,
  showPlanForm,
  setShowPlanForm,
  editingPlan,
  planFormData,
  handlePlanSubmit,
  resetPlanForm,
  handlePlanInputChange,
  handleServiceToggle
}: PlanModalProps) => {
  return (
    <Dialog open={showPlanForm} onOpenChange={setShowPlanForm}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? "Editar Plano" : "Novo Plano"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handlePlanSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              value={planFormData.name}
              onChange={(e) => handlePlanInputChange("name", e.target.value)}
              placeholder="Digite o nome do plano"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={planFormData.description}
              onChange={(e) => handlePlanInputChange("description", e.target.value)}
              placeholder="Digite a descrição do plano"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="recurrence">Recorrência</Label>
            <Select 
              value={planFormData.recurrence} 
              onValueChange={(value: "mensal" | "unico") => handlePlanInputChange("recurrence", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="unico">Único</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={planFormData.value}
              onChange={(e) => handlePlanInputChange("value", Number(e.target.value))}
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={planFormData.status} 
              onValueChange={(value: "Ativo" | "Inativo") => handlePlanInputChange("status", value)}
            >
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
            <Label>Serviços Inclusos</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3 mt-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={planFormData.servicesIds.includes(service.id)}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  />
                  <Label 
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {service.name}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selecione os serviços que fazem parte deste plano
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={resetPlanForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingPlan ? "Atualizar" : "Criar"} Plano
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

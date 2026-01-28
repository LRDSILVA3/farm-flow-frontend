import { FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CostVariable } from "./../../../hooks/useCostVariables";

interface CostVariableModalProps {
  showCostVariableForm: boolean;
  resetCostVariableForm: () => void;
  editingCostVariable: CostVariable | null;
  costVariableFormData: CostVariable;
  handleCostVariableInputChange: (field: keyof CostVariable, value: string | number) => void;
  handleCostVariableSubmit: (e: FormEvent) => void;
}

export const VariavelCustoModal: React.FC<CostVariableModalProps> = ({
  showCostVariableForm,
  resetCostVariableForm,
  editingCostVariable,
  costVariableFormData,
  handleCostVariableInputChange,
  handleCostVariableSubmit
}) => {
  return (
    <Dialog open={showCostVariableForm} onOpenChange={(open) => !open && resetCostVariableForm()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingCostVariable ? "Editar Variável de Custo" : "Nova Variável de Custo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCostVariableSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={costVariableFormData.name}
                onChange={(e) => handleCostVariableInputChange("name", e.target.value)}
                placeholder="Ex: Valor por Alqueire"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={costVariableFormData.code}
                onChange={(e) => handleCostVariableInputChange("code", e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="Ex: valor_alqueire"
                required
              />
              <p className="text-xs text-muted-foreground">
                Código único usado nos cálculos (sem espaços)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={costVariableFormData.value}
                onChange={(e) => handleCostVariableInputChange("value", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={costVariableFormData.description}
                onChange={(e) => handleCostVariableInputChange("description", e.target.value)}
                placeholder="Descrição da variável e como ela é utilizada"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetCostVariableForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingCostVariable ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

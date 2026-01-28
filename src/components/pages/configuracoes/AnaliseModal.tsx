
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Analysis } from "./../../../hooks/useAnalyses";

interface AnalysisModalProps {
  showAnalysisForm: boolean;
  setShowAnalysisForm: (show: boolean) => void;
  editingAnalysis: Analysis | null;
  analysisFormData: Analysis;
  handleAnalysisInputChange: (field: keyof Analysis, value: string | number) => void;
  handleAnalysisSubmit: (e: React.FormEvent) => void;
  resetAnalysisForm: () => void;
}

const tiposAnalise = ["Macro", "Macro+S", "Macro+S+P_rem", "Foliar", "Compactação"];
const colaboradoresDisponiveis = ["Laboratorio 1", "Laboratorio 2"];

export const AnaliseModal = ({
  showAnalysisForm,
  setShowAnalysisForm,
  editingAnalysis,
  analysisFormData,
  handleAnalysisInputChange,
  handleAnalysisSubmit,
  resetAnalysisForm
}: AnalysisModalProps) => {
  return (
    <Dialog open={showAnalysisForm} onOpenChange={setShowAnalysisForm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingAnalysis ? "Editar Análise" : "Nova Análise"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAnalysisSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Select
              value={analysisFormData.name}
              onValueChange={(value) => handleAnalysisInputChange("name", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de análise" />
              </SelectTrigger>
              <SelectContent>
                {tiposAnalise.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={analysisFormData.type}
              onValueChange={(value) => handleAnalysisInputChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solo">Solo</SelectItem>
                <SelectItem value="Folha">Folha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colaborador">Colaborador</Label>
            <Select
              value={analysisFormData.collaborator}
              onValueChange={(value) => handleAnalysisInputChange("collaborator", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {colaboradoresDisponiveis.map((colaborador) => (
                  <SelectItem key={colaborador} value={colaborador}>{colaborador}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prazo">Prazo (dias)</Label>
            <Input
              id="prazo"
              type="number"
              value={analysisFormData.deadline}
              onChange={(e) => handleAnalysisInputChange("deadline", parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              value={analysisFormData.value}
              onChange={(e) => handleAnalysisInputChange("value", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={analysisFormData.status}
              onValueChange={(value) => handleAnalysisInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetAnalysisForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingAnalysis ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

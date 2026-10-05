
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Analysis } from "../../../hooks/useAnalyses";

interface AnalysisModalProps {
  showAnalysisForm: boolean;
  setShowAnalysisForm: (show: boolean) => void;
  editingAnalysis: Analysis | null;
  analysisFormData: Analysis;
  handleAnalysisInputChange: (field: keyof Analysis, value: string | number) => void;
  handleAnalysisSubmit: (e: React.FormEvent) => void;
  resetAnalysisForm: () => void;
}

export const TIPOS_ANALISE_OFICIAIS = [
  { value: "MACRO+S+P_REM", label: "MACRO+S+P_REM (Completa 0-20 cm)" },
  { value: "MACRO+S", label: "MACRO+S (Profundidade 20-40 cm)" },
  { value: "MACRO", label: "MACRO (Análise Simples)" },
  { value: "ANALISE DE FOLIAR", label: "ANALISE DE FOLIAR (Nutrição Foliar)" },
  { value: "ANÁLISE FÍSICA", label: "ANÁLISE FÍSICA (Granulometria / Textura)" },
  { value: "ANÁLISE 20-40 CM", label: "ANÁLISE 20-40 CM (Subsuperficial)" }
];

const colaboradoresDisponiveis = [
  "Laboratório Solo Forte",
  "Laboratório AgroAnálises",
  "IBRA Análises",
  "Laboratório Coodetec"
];

export const AnalysisModal = ({
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
                {TIPOS_ANALISE_OFICIAIS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
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

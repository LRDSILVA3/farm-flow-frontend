
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnaliseConfig } from "./useAnalises";

interface AnaliseModalProps {
  showAnaliseForm: boolean;
  setShowAnaliseForm: (show: boolean) => void;
  editingAnalise: AnaliseConfig | null;
  analiseFormData: AnaliseConfig;
  handleAnaliseInputChange: (field: keyof AnaliseConfig, value: string | number) => void;
  handleAnaliseSubmit: (e: React.FormEvent) => void;
  resetAnaliseForm: () => void;
}

const tiposAnalise = ["Macro", "Macro+S", "Macro+S+P_rem", "Foliar", "Compactação"];
const colaboradoresDisponiveis = ["Laboratorio 1", "Laboratorio 2"];

export const AnaliseModal = ({
  showAnaliseForm,
  setShowAnaliseForm,
  editingAnalise,
  analiseFormData,
  handleAnaliseInputChange,
  handleAnaliseSubmit,
  resetAnaliseForm
}: AnaliseModalProps) => {
  return (
    <Dialog open={showAnaliseForm} onOpenChange={setShowAnaliseForm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingAnalise ? "Editar Análise" : "Nova Análise"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAnaliseSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Select
              value={analiseFormData.nome}
              onValueChange={(value) => handleAnaliseInputChange("nome", value)}
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
              value={analiseFormData.tipo}
              onValueChange={(value) => handleAnaliseInputChange("tipo", value)}
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
              value={analiseFormData.colaborador}
              onValueChange={(value) => handleAnaliseInputChange("colaborador", value)}
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
              value={analiseFormData.prazo}
              onChange={(e) => handleAnaliseInputChange("prazo", parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              value={analiseFormData.valor}
              onChange={(e) => handleAnaliseInputChange("valor", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={analiseFormData.status}
              onValueChange={(value) => handleAnaliseInputChange("status", value)}
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
            <Button type="button" variant="outline" onClick={resetAnaliseForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingAnalise ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

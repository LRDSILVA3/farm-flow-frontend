
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Colaborador } from "./useColaboradores";

interface ColaboradorModalProps {
  showColaboradorForm: boolean;
  setShowColaboradorForm: (show: boolean) => void;
  editingColaborador: Colaborador | null;
  colaboradorFormData: Colaborador;
  handleColaboradorInputChange: (field: keyof Colaborador, value: string) => void;
  handleColaboradorSubmit: (e: React.FormEvent) => void;
  resetColaboradorForm: () => void;
}

export const ColaboradorModal = ({
  showColaboradorForm,
  setShowColaboradorForm,
  editingColaborador,
  colaboradorFormData,
  handleColaboradorInputChange,
  handleColaboradorSubmit,
  resetColaboradorForm
}: ColaboradorModalProps) => {
  return (
    <Dialog open={showColaboradorForm} onOpenChange={setShowColaboradorForm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleColaboradorSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={colaboradorFormData.nome}
              onChange={(e) => handleColaboradorInputChange("nome", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={colaboradorFormData.endereco}
              onChange={(e) => handleColaboradorInputChange("endereco", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={colaboradorFormData.status}
              onValueChange={(value) => handleColaboradorInputChange("status", value)}
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
            <Button type="button" variant="outline" onClick={resetColaboradorForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingColaborador ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

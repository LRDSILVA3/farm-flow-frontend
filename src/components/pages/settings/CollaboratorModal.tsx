
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collaborator } from "../../../hooks/useCollaborators";

interface CollaboratorModalProps {
  showCollaboratorForm: boolean;
  setShowCollaboratorForm: (show: boolean) => void;
  editingCollaborator: Collaborator | null;
  collaboratorFormData: Collaborator;
  handleCollaboratorInputChange: (field: keyof Collaborator, value: string) => void;
  handleCollaboratorSubmit: (e: React.FormEvent) => void;
  resetCollaboratorForm: () => void;
}

export const ColaboradorModal = ({
  showCollaboratorForm,
  setShowCollaboratorForm,
  editingCollaborator,
  collaboratorFormData,
  handleCollaboratorInputChange,
  handleCollaboratorSubmit,
  resetCollaboratorForm
}: CollaboratorModalProps) => {
  return (
    <Dialog open={showCollaboratorForm} onOpenChange={setShowCollaboratorForm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingCollaborator ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCollaboratorSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={collaboratorFormData.name}
              onChange={(e) => handleCollaboratorInputChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={collaboratorFormData.address}
              onChange={(e) => handleCollaboratorInputChange("address", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={collaboratorFormData.status}
              onValueChange={(value) => handleCollaboratorInputChange("status", value)}
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
            <Button type="button" variant="outline" onClick={resetCollaboratorForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingCollaborator ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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

export const CollaboratorModal = ({
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {editingCollaborator ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCollaboratorSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              placeholder="Ex: João da Silva"
              value={collaboratorFormData.name}
              onChange={(e) => handleCollaboratorInputChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cargo">Função / Cargo</Label>
              <Input
                id="cargo"
                placeholder="Ex: Piloto de Drone, Operador"
                value={collaboratorFormData.role}
                onChange={(e) => handleCollaboratorInputChange("role", e.target.value)}
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
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone / WhatsApp</Label>
              <Input
                id="telefone"
                placeholder="(45) 99999-9999"
                value={collaboratorFormData.phone}
                onChange={(e) => handleCollaboratorInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@preciza.com.br"
                value={collaboratorFormData.email}
                onChange={(e) => handleCollaboratorInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={resetCollaboratorForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingCollaborator ? "Atualizar" : "Salvar Colaborador"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

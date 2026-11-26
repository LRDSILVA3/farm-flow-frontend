import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collaborator } from "../../../hooks/useCollaborators";
import { usePositions } from "../../../hooks/usePositions";
import { ROLE_OPTIONS } from "@/constants/permissions";

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
  const { positions } = usePositions();

  const roleOptions = useMemo(() => {
    const list: string[] = [];

    // 1. Cargos ativos cadastrados no sistema
    positions.forEach((p) => {
      if (p.name && p.status !== "Inativo") {
        const trimmed = p.name.trim();
        if (!list.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
          list.push(trimmed);
        }
      }
    });

    // 2. Cargos padrão do sistema
    ROLE_OPTIONS.forEach((r) => {
      if (!list.some((item) => item.toLowerCase() === r.toLowerCase())) {
        list.push(r);
      }
    });

    // 3. Funções operacionais comuns de campo se não existirem
    ["Técnico Agrícola", "Piloto de Drone"].forEach((r) => {
      if (!list.some((item) => item.toLowerCase() === r.toLowerCase())) {
        list.push(r);
      }
    });

    // 4. Valor atual do colaborador se já preenchido
    if (collaboratorFormData.role && collaboratorFormData.role.trim()) {
      const current = collaboratorFormData.role.trim();
      if (!list.some((item) => item.toLowerCase() === current.toLowerCase())) {
        list.push(current);
      }
    }

    return list;
  }, [positions, collaboratorFormData.role]);
  return (
    <Dialog open={showCollaboratorForm} onOpenChange={setShowCollaboratorForm}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {editingCollaborator ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cadastro de operadores, técnicos de amostragem e agrônomos de campo
          </DialogDescription>
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
              <Select
                value={collaboratorFormData.role || "Operador de Campo"}
                onValueChange={(value) => handleCollaboratorInputChange("role", value)}
              >
                <SelectTrigger id="cargo">
                  <SelectValue placeholder="Selecione o cargo / função" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

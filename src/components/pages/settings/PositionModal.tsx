import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Eye, Edit3, CheckCheck, RotateCcw } from "lucide-react";
import { PERMISSION_MODULES, PermissionKey } from "@/constants/permissions";
import { Position } from "@/hooks/usePositions";

interface PositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionToEdit?: Position | null;
  onSave: (data: {
    id?: string;
    name: string;
    status: "Ativo" | "Inativo";
    permissions: PermissionKey[];
  }) => Promise<boolean>;
}

export const PositionModal: React.FC<PositionModalProps> = ({
  open,
  onOpenChange,
  positionToEdit,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"Ativo" | "Inativo">("Ativo");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (positionToEdit) {
      setName(positionToEdit.name || "");
      setStatus(positionToEdit.status || "Ativo");
      setSelectedPermissions(positionToEdit.permissions || []);
    } else {
      setName("");
      setStatus("Ativo");
      // Padrão: visualizar dashboard
      setSelectedPermissions(["dashboard:view"]);
    }
  }, [positionToEdit, open]);

  const handleToggleView = (modId: string, checked: boolean) => {
    const viewKey = `${modId}:view`;
    const editKey = `${modId}:edit`;

    setSelectedPermissions((prev) => {
      let next = [...prev];
      if (checked) {
        if (!next.includes(viewKey)) next.push(viewKey);
      } else {
        // Se desmarca visualizar, remove também edição e módulo base
        next = next.filter((k) => k !== viewKey && k !== editKey && k !== modId);
      }
      return next;
    });
  };

  const handleToggleEdit = (modId: string, checked: boolean) => {
    const viewKey = `${modId}:view`;
    const editKey = `${modId}:edit`;

    setSelectedPermissions((prev) => {
      let next = [...prev];
      if (checked) {
        if (!next.includes(editKey)) next.push(editKey);
        // Ao marcar editar, garante visualizar
        if (!next.includes(viewKey)) next.push(viewKey);
      } else {
        next = next.filter((k) => k !== editKey && k !== modId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const all: PermissionKey[] = [];
    PERMISSION_MODULES.forEach((mod) => {
      all.push(mod.viewKey, mod.editKey);
    });
    setSelectedPermissions(all);
  };

  const handleSelectOnlyView = () => {
    const views: PermissionKey[] = PERMISSION_MODULES.map((mod) => mod.viewKey);
    setSelectedPermissions(views);
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const success = await onSave({
      id: positionToEdit?.id,
      name: name.trim(),
      status,
      permissions: selectedPermissions,
    });
    setSaving(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {positionToEdit ? "Editar Cargo e Permissões" : "Novo Cargo e Níveis de Acesso"}
          </DialogTitle>
          <DialogDescription>
            Configure as permissões granulares de visualização e edição atribuídas a este cargo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="posName">Nome do Cargo *</Label>
              <Input
                id="posName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Engenheiro Agrônomo, Supervisor, Assistente..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="posStatus">Status</Label>
              <Select
                value={status}
                onValueChange={(val: "Ativo" | "Inativo") => setStatus(val)}
              >
                <SelectTrigger id="posStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Matriz de Permissões */}
          <div className="border rounded-lg p-3 bg-slate-50/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
              <div>
                <Label className="font-semibold text-sm">Controle de Módulos do Sistema</Label>
                <p className="text-xs text-muted-foreground">
                  Marque o que este cargo pode <strong>Visualizar</strong> e o que pode <strong>Editar / Interagir</strong>.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleSelectAll}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1 text-green-600" />
                  Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleSelectOnlyView}
                >
                  <Eye className="h-3.5 w-3.5 mr-1 text-blue-600" />
                  Apenas Ver
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-slate-500"
                  onClick={handleClearAll}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {PERMISSION_MODULES.map((mod) => {
                const isViewChecked =
                  selectedPermissions.includes(mod.viewKey) ||
                  selectedPermissions.includes(mod.id) ||
                  selectedPermissions.includes(mod.editKey);

                const isEditChecked =
                  selectedPermissions.includes(mod.editKey) ||
                  selectedPermissions.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    className="py-2.5 flex items-center justify-between gap-4 hover:bg-white/60 px-2 rounded transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-tight">
                        {mod.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {mod.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {/* Checkbox Visualizar */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                        <Checkbox
                          checked={isViewChecked}
                          onCheckedChange={(checked) =>
                            handleToggleView(mod.id, !!checked)
                          }
                        />
                        <Eye className="h-3.5 w-3.5 text-blue-600 inline" />
                        <span>Visualizar</span>
                      </label>

                      {/* Checkbox Editar */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                        <Checkbox
                          checked={isEditChecked}
                          onCheckedChange={(checked) =>
                            handleToggleEdit(mod.id, !!checked)
                          }
                        />
                        <Edit3 className="h-3.5 w-3.5 text-green-600 inline" />
                        <span>Editar</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={saving || !name.trim()}
            >
              {saving ? "Salvando..." : positionToEdit ? "Salvar Alterações" : "Criar Cargo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

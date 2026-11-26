import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Edit3, CheckCheck, RotateCcw } from "lucide-react";
import {
  PERMISSION_MODULES,
  PermissionKey,
  ROLE_OPTIONS,
} from "@/constants/permissions";
import { User } from "./useUser";
import { Position } from "@/hooks/usePositions";

interface UserModalProps {
  showUserForm: boolean;
  setShowUserForm: (value: boolean) => void;
  editingUser: User | null;
  userFormData: User;
  handleUserSubmit: (e: React.FormEvent) => void;
  resetUserForm: () => void;
  handleUserInputChange: (field: keyof User, value: any) => void;
  handleRoleChange: (role: string) => void;
  handlePermissionChange: (permission: PermissionKey, checked: boolean) => void;
  handleSelectAllPermissions: () => void;
  handleClearPermissions: () => void;
  positions?: Position[];
}

export const UserModal: React.FC<UserModalProps> = ({
  showUserForm,
  setShowUserForm,
  editingUser,
  userFormData,
  handleUserSubmit,
  resetUserForm,
  handleUserInputChange,
  handleRoleChange,
  handleSelectAllPermissions,
  handleClearPermissions,
  positions = [],
}) => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!showUserForm) {
      setShowPassword(false);
    }
  }, [showUserForm]);

  const allRoleOptions = useMemo(() => {
    const list = [...ROLE_OPTIONS] as string[];
    positions.forEach((p) => {
      if (p.name && !list.some((r) => r.toLowerCase() === p.name.toLowerCase())) {
        list.push(p.name);
      }
    });
    return list;
  }, [positions]);

  const handleToggleModuleView = (modId: string, checked: boolean) => {
    let next = [...userFormData.permissions];
    if (checked) {
      if (!next.includes(modId)) next.push(modId);
    } else {
      next = next.filter((k) => k !== modId && k !== `${modId}:view` && k !== `${modId}:edit`);
    }
    handleUserInputChange("permissions", next);
  };

  const handleToggleModuleEdit = (modId: string, checked: boolean) => {
    const editKey = `${modId}:edit`;
    let next = [...userFormData.permissions];
    if (checked) {
      if (!next.includes(editKey)) next.push(editKey);
      if (!next.includes(modId)) next.push(modId);
    } else {
      next = next.filter((k) => k !== editKey);
    }
    handleUserInputChange("permissions", next);
  };

  const handleSelectOnlyView = () => {
    const views: PermissionKey[] = PERMISSION_MODULES.map((mod) => mod.viewKey);
    handleUserInputChange("permissions", views);
  };

  const handleSelectAll = () => {
    const all: PermissionKey[] = [];
    PERMISSION_MODULES.forEach((mod) => {
      all.push(mod.viewKey, mod.editKey);
    });
    handleUserInputChange("permissions", all);
  };

  return (
    <Dialog
      open={showUserForm}
      onOpenChange={(open) => {
        if (!open) {
          resetUserForm();
        } else {
          setShowUserForm(true);
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Gerenciar dados de acesso, cargo, status e permissões do usuário
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUserSubmit} autoComplete="off" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userName">Nome Completo</Label>
              <Input
                id="userName"
                autoComplete="off"
                value={userFormData.name}
                onChange={(e) => handleUserInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                autoComplete="off"
                value={userFormData.email}
                onChange={(e) => handleUserInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="userPassword">
              {editingUser ? "Nova Senha (opcional)" : "Senha de Acesso"}
            </Label>
            <div className="relative">
              <Input
                id="userPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={userFormData.password || ""}
                onChange={(e) => handleUserInputChange("password", e.target.value)}
                placeholder={editingUser ? "Deixe em branco para manter a senha atual" : "Mínimo 6 caracteres"}
                required={!editingUser}
                minLength={editingUser ? undefined : 6}
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar caracteres" : "Exibir caracteres"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userPhone">Telefone</Label>
              <Input
                id="userPhone"
                value={userFormData.phone}
                onChange={(e) => handleUserInputChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="userRole">Cargo</Label>
              <Select value={userFormData.role} onValueChange={handleRoleChange}>
                <SelectTrigger id="userRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allRoleOptions.map((roleName) => (
                    <SelectItem key={roleName} value={roleName}>
                      {roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Ao alterar o cargo, o perfil padrão de permissões é preenchido automaticamente.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="userStatus">Status</Label>
            <Select value={userFormData.status} onValueChange={(value) => handleUserInputChange("status", value)}>
              <SelectTrigger id="userStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 border rounded-lg p-3 bg-slate-50/70">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
              <div>
                <Label className="font-semibold text-sm">Permissões de Acesso aos Módulos</Label>
                <p className="text-xs text-muted-foreground">
                  Personalize o que este usuário pode Visualizar e Editar.
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
                  className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
                  onClick={handleClearPermissions}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {PERMISSION_MODULES.map((mod) => {
                const isViewChecked =
                  userFormData.permissions.includes(mod.viewKey) ||
                  userFormData.permissions.includes(mod.id) ||
                  userFormData.permissions.includes(mod.editKey);

                const isEditChecked =
                  userFormData.permissions.includes(mod.editKey) ||
                  userFormData.permissions.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    className="py-2.5 flex items-center justify-between gap-4 hover:bg-white/60 px-2 rounded transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`permission-${mod.id}`}
                        className="text-sm font-medium text-slate-800 leading-tight cursor-pointer"
                      >
                        {mod.name}
                      </Label>
                      <p className="text-xs text-muted-foreground truncate">
                        {mod.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Checkbox
                          id={`permission-${mod.id}`}
                          checked={isViewChecked}
                          onCheckedChange={(checked) =>
                            handleToggleModuleView(mod.id, !!checked)
                          }
                        />
                        <Eye className="h-3.5 w-3.5 text-blue-600 inline" />
                        <span className="text-[11px] text-muted-foreground">Ver</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Checkbox
                          id={`permission-${mod.id}-edit`}
                          checked={isEditChecked}
                          onCheckedChange={(checked) =>
                            handleToggleModuleEdit(mod.id, !!checked)
                          }
                        />
                        <Edit3 className="h-3.5 w-3.5 text-green-600 inline" />
                        <span className="text-[11px] text-muted-foreground">Editar</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={resetUserForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingUser ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

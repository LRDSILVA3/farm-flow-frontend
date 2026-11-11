import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import {
  AVAILABLE_PERMISSIONS,
  PermissionKey,
  ROLE_OPTIONS,
} from "@/constants/permissions";
import { User } from "./useUser";

interface UserModalProps {
  showUserForm: boolean;
  setShowUserForm: (value: boolean) => void;
  editingUser: User | null;
  userFormData: User;
  handleUserSubmit: (e: React.FormEvent) => void;
  resetUserForm: () => void;
  handleUserInputChange: (field: keyof User, value: string | string[]) => void;
  handleRoleChange: (role: string) => void;
  handlePermissionChange: (permission: PermissionKey, checked: boolean) => void;
  handleSelectAllPermissions: () => void;
  handleClearPermissions: () => void;
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
  handlePermissionChange,
  handleSelectAllPermissions,
  handleClearPermissions,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!showUserForm) {
      setShowPassword(false);
    }
  }, [showUserForm]);

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
                  {ROLE_OPTIONS.map((roleName) => (
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="font-semibold">Permissões de Acesso aos Módulos</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-green-700 hover:text-green-800"
                  onClick={handleSelectAllPermissions}
                >
                  Selecionar Todas
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
                  onClick={handleClearPermissions}
                >
                  Limpar
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    checked={userFormData.permissions.includes(permission.id)}
                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`permission-${permission.id}`} className="text-sm font-normal cursor-pointer">
                    {permission.name}
                  </Label>
                </div>
              ))}
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

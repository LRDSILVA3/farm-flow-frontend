
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "./useUser";

interface UserModalProps {
  showUserForm: boolean;
  setShowUserForm: (value: boolean) => void;
  editingUser: User | null;
  userFormData: User;
  handleUserSubmit: (e: React.FormEvent) => void;
  resetUserForm: () => void;
  handleUserInputChange: (field: keyof User, value: string | string[]) => void;
  handlePermissionChange: (permission: string, checked: boolean) => void;
}

const availablePermissions = [
  { id: "dashboard", name: "Dashboard" },
  { id: "farms", name: "Fazendas" },
  { id: "orders", name: "Pedidos" },
  { id: "schedule", name: "Agenda" },
  { id: "analysis", name: "Análises" },
  { id: "financial", name: "Financeiro" },
  { id: "customers", name: "Clientes" },
  { id: "reports", name: "Relatórios & Auditoria" },
  { id: "settings", name: "Configurações" }
];

export const UserModal: React.FC<UserModalProps> = ({
  showUserForm,
  setShowUserForm,
  editingUser,
  userFormData,
  handleUserSubmit,
  resetUserForm,
  handleUserInputChange,
  handlePermissionChange
}) => {
  return (
    <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userName">Nome Completo</Label>
              <Input
                id="userName"
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
                value={userFormData.email}
                onChange={(e) => handleUserInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
              <Select value={userFormData.role} onValueChange={(value) => handleUserInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Operador de Campo">Operador de Campo</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Analista">Analista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="userStatus">Status</Label>
            <Select value={userFormData.status} onValueChange={(value) => handleUserInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Permissões</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    checked={userFormData.permissions.includes(permission.id)}
                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`permission-${permission.id}`} className="text-sm font-normal">
                    {permission.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
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

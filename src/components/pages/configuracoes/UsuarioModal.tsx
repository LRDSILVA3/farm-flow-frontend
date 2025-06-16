
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Usuario } from "./useUsuarios";

interface UsuarioModalProps {
  showUsuarioForm: boolean;
  setShowUsuarioForm: (value: boolean) => void;
  editingUsuario: Usuario | null;
  usuarioFormData: Usuario;
  handleUsuarioSubmit: (e: React.FormEvent) => void;
  resetUsuarioForm: () => void;
  handleUsuarioInputChange: (field: keyof Usuario, value: string | string[]) => void;
  handlePermissaoChange: (permissao: string, checked: boolean) => void;
}

const permissoesDisponiveis = [
  { id: "dashboard", nome: "Dashboard" },
  { id: "fazendas", nome: "Fazendas" },
  { id: "pedidos", nome: "Pedidos" },
  { id: "agenda", nome: "Agenda" },
  { id: "analises", nome: "Análises" },
  { id: "financeiro", nome: "Financeiro" },
  { id: "clientes", nome: "Clientes" },
  { id: "configuracoes", nome: "Configurações" }
];

export const UsuarioModal: React.FC<UsuarioModalProps> = ({
  showUsuarioForm,
  setShowUsuarioForm,
  editingUsuario,
  usuarioFormData,
  handleUsuarioSubmit,
  resetUsuarioForm,
  handleUsuarioInputChange,
  handlePermissaoChange
}) => {
  return (
    <Dialog open={showUsuarioForm} onOpenChange={setShowUsuarioForm}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {editingUsuario ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUsuarioSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usuarioNome">Nome Completo</Label>
              <Input
                id="usuarioNome"
                value={usuarioFormData.nome}
                onChange={(e) => handleUsuarioInputChange("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="usuarioEmail">Email</Label>
              <Input
                id="usuarioEmail"
                type="email"
                value={usuarioFormData.email}
                onChange={(e) => handleUsuarioInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usuarioTelefone">Telefone</Label>
              <Input
                id="usuarioTelefone"
                value={usuarioFormData.telefone}
                onChange={(e) => handleUsuarioInputChange("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="usuarioCargo">Cargo</Label>
              <Select value={usuarioFormData.cargo} onValueChange={(value) => handleUsuarioInputChange("cargo", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Analista">Analista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="usuarioStatus">Status</Label>
            <Select value={usuarioFormData.status} onValueChange={(value) => handleUsuarioInputChange("status", value)}>
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
              {permissoesDisponiveis.map((permissao) => (
                <div key={permissao.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`permissao-${permissao.id}`}
                    checked={usuarioFormData.permissoes.includes(permissao.id)}
                    onChange={(e) => handlePermissaoChange(permissao.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`permissao-${permissao.id}`} className="text-sm font-normal">
                    {permissao.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetUsuarioForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingUsuario ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

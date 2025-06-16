import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  status: string;
  permissoes: string[];
  dataCriacao: string;
}

export const useUsuarios = () => {
  const { toast } = useToast();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { 
      id: "1", 
      nome: "João Silva", 
      email: "joao@email.com", 
      telefone: "(11) 99999-9999",
      cargo: "Administrador", 
      status: "Ativo", 
      permissoes: ["dashboard", "fazendas", "pedidos", "analises", "financeiro", "configuracoes"],
      dataCriacao: "2024-01-15"
    },
    { 
      id: "2", 
      nome: "Maria Santos", 
      email: "maria@email.com", 
      telefone: "(11) 88888-8888",
      cargo: "Operador", 
      status: "Ativo", 
      permissoes: ["dashboard", "fazendas", "pedidos", "analises"],
      dataCriacao: "2024-02-20"
    }
  ]);

  const [usuariosPage, setUsuariosPage] = useState(1);
  const [usuariosPerPage, setUsuariosPerPage] = useState(10);
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [usuarioFormData, setUsuarioFormData] = useState<Usuario>({
    id: "",
    nome: "",
    email: "",
    telefone: "",
    cargo: "Operador",
    status: "Ativo",
    permissoes: [],
    dataCriacao: ""
  });

  const handleEditUsuario = (usuario: Usuario) => {
    console.log("Editando usuário:", usuario);
    setEditingUsuario(usuario);
    setUsuarioFormData(usuario);
    setShowUsuarioForm(true);
  };

  const handleUsuarioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUsuario) {
      setUsuarios(prev => prev.map(u => u.id === editingUsuario.id ? usuarioFormData : u));
      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso.",
      });
    } else {
      const newUsuario = { 
        ...usuarioFormData, 
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString().split('T')[0]
      };
      setUsuarios(prev => [...prev, newUsuario]);
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      });
    }
    
    resetUsuarioForm();
  };

  const resetUsuarioForm = () => {
    setUsuarioFormData({
      id: "",
      nome: "",
      email: "",
      telefone: "",
      cargo: "Operador",
      status: "Ativo",
      permissoes: [],
      dataCriacao: ""
    });
    setEditingUsuario(null);
    setShowUsuarioForm(false);
  };

  const handleUsuarioInputChange = (field: keyof Usuario, value: string | string[]) => {
    setUsuarioFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissaoChange = (permissao: string, checked: boolean) => {
    if (checked) {
      setUsuarioFormData(prev => ({ 
        ...prev, 
        permissoes: [...prev.permissoes, permissao] 
      }));
    } else {
      setUsuarioFormData(prev => ({ 
        ...prev, 
        permissoes: prev.permissoes.filter(p => p !== permissao) 
      }));
    }
  };

  // Pagination logic
  const totalUsuarios = usuarios.length;
  const totalUsuariosPages = Math.ceil(totalUsuarios / usuariosPerPage);
  const usuariosStartIndex = (usuariosPage - 1) * usuariosPerPage;
  const usuariosEndIndex = usuariosStartIndex + usuariosPerPage;
  const currentUsuarios = usuarios.slice(usuariosStartIndex, usuariosEndIndex);

  return {
    usuarios,
    usuariosPage,
    setUsuariosPage,
    usuariosPerPage,
    setUsuariosPerPage,
    showUsuarioForm,
    setShowUsuarioForm,
    editingUsuario,
    usuarioFormData,
    handleEditUsuario,
    handleUsuarioSubmit,
    resetUsuarioForm,
    handleUsuarioInputChange,
    handlePermissaoChange,
    totalUsuarios,
    totalUsuariosPages,
    usuariosStartIndex,
    usuariosEndIndex,
    currentUsuarios
  };
};

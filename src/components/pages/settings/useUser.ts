import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  permissions: string[];
  creationDate: string;
}

export const useUser = () => {
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([
    { 
      id: "1", 
      name: "João Silva", 
      email: "joao@email.com", 
      phone: "(11) 99999-9999",
      role: "Administrador", 
      status: "Ativo", 
      permissions: ["dashboard", "farms", "orders", "analysis", "financial", "settings"],
      creationDate: "2024-01-15"
    },
    { 
      id: "2", 
      name: "Maria Santos", 
      email: "maria@email.com", 
      phone: "(11) 88888-8888",
      role: "Operador", 
      status: "Ativo", 
      permissions: ["dashboard", "farms", "orders", "analysis"],
      creationDate: "2024-02-20"
    }
  ]);

  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<User>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "Operador",
    status: "Ativo",
    permissions: [],
    creationDate: ""
  });

  const handleEditUser = (user: User) => {
    console.log("Editing user:", user);
    setEditingUser(user);
    setUserFormData(user);
    setShowUserForm(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? userFormData : u));
      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso.",
      });
    } else {
      const newUser = { 
        ...userFormData, 
        id: Date.now().toString(),
        creationDate: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      });
    }
    
    resetUserForm();
  };

  const resetUserForm = () => {
    setUserFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      role: "Operador",
      status: "Ativo",
      permissions: [],
      creationDate: ""
    });
    setEditingUser(null);
    setShowUserForm(false);
  };

  const handleUserInputChange = (field: keyof User, value: string | string[]) => {
    setUserFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setUserFormData(prev => ({ 
        ...prev, 
        permissions: [...prev.permissions, permission] 
      }));
    } else {
      setUserFormData(prev => ({ 
        ...prev, 
        permissions: prev.permissions.filter(p => p !== permission) 
      }));
    }
  };

  // Pagination logic
  const totalUsers = users.length;
  const totalUsersPages = Math.ceil(totalUsers / usersPerPage);
  const usersStartIndex = (usersPage - 1) * usersPerPage;
  const usersEndIndex = usersStartIndex + usersPerPage;
  const currentUsers = users.slice(usersStartIndex, usersEndIndex);

  return {
    users,
    usersPage,
    setUsersPage,
    usersPerPage,
    setUsersPerPage,
    showUserForm,
    setShowUserForm,
    editingUser,
    userFormData,
    handleEditUser,
    handleUserSubmit,
    resetUserForm,
    handleUserInputChange,
    handlePermissionChange,
    totalUsers,
    totalUsersPages,
    usersStartIndex,
    usersEndIndex,
    currentUsers
  };
};

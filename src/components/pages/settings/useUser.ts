import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { formatDateBR } from "@/lib/utils";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import { syncCurrentUserProfile, useAuth } from "@/hooks/useAuth";
import {
  AVAILABLE_PERMISSIONS,
  getDefaultPermissionsForRole,
  normalizeRoleLabel,
  PermissionKey,
  resolveUserPermissions,
  sanitizePermissions,
} from "@/constants/permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: string;
  status: string;
  permissions: PermissionKey[];
  creationDate: string;
}

const createInitialFormData = (role = "Operador de Campo"): User => {
  const normalizedRole = normalizeRoleLabel(role);
  return {
    id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    role: normalizedRole,
    status: "Ativo",
    permissions: getDefaultPermissionsForRole(normalizedRole),
    creationDate: "",
  };
};

export const useUser = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useSafeQueryClient();

  const { data: users = [], isLoading: loading } = useQuery<User[]>({
    queryKey: ["system-users"],
    queryFn: async () => {
      const data = await api.get<any[]>("/users");
      if (!Array.isArray(data)) return [];
      return data.map((u) => {
        const roleLabel = normalizeRoleLabel(u.role);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "",
          role: roleLabel,
          status: u.status === "Inativo" ? "Inativo" : "Ativo",
          permissions: resolveUserPermissions({
            role: roleLabel,
            permissions: u.permissions,
          }),
          creationDate: formatDateBR(u.created_at),
        };
      });
    },
  }, queryClient);

  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<User>(() => createInitialFormData());

  const resetUserForm = () => {
    setUserFormData(createInitialFormData());
    setEditingUser(null);
    setShowUserForm(false);
  };

  const handleOpenNewUser = () => {
    setEditingUser(null);
    setUserFormData(createInitialFormData());
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      ...user,
      phone: user.phone || "",
      status: user.status === "Inativo" ? "Inativo" : "Ativo",
      role: normalizeRoleLabel(user.role),
      permissions: resolveUserPermissions(user),
      password: "",
    });
    setShowUserForm(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedPermissions = sanitizePermissions(userFormData.permissions);
    const normalizedRole = normalizeRoleLabel(userFormData.role);
    const normalizedStatus = userFormData.status === "Inativo" ? "Inativo" : "Ativo";
    const trimmedPhone = (userFormData.phone || "").trim();

    try {
      if (editingUser) {
        if (userFormData.password && userFormData.password.trim().length > 0 && userFormData.password.trim().length < 6) {
          toast({
            title: "Senha inválida",
            description: "A nova senha deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
          return;
        }

        const payload: any = {
          name: userFormData.name.trim(),
          email: userFormData.email.trim(),
          role: normalizedRole,
          phone: trimmedPhone,
          status: normalizedStatus,
          permissions: sanitizedPermissions,
        };
        if (userFormData.password && userFormData.password.trim() !== "") {
          payload.password = userFormData.password.trim();
        }

        const updated = await api.put<any>(`/users/${editingUser.id}`, payload);
        syncCurrentUserProfile(updated || { id: editingUser.id, ...payload });
        toast({
          title: "Usuário atualizado",
          description: "Dados e permissões atualizados com sucesso.",
        });
      } else {
        if (!userFormData.password || userFormData.password.trim().length < 6) {
          toast({
            title: "Senha obrigatória",
            description: "Informe uma senha com pelo menos 6 caracteres.",
            variant: "destructive",
          });
          return;
        }

        await api.post<any>("/users", {
          name: userFormData.name.trim(),
          email: userFormData.email.trim(),
          password: userFormData.password.trim(),
          role: normalizedRole,
          phone: trimmedPhone,
          status: normalizedStatus,
          permissions: sanitizedPermissions,
        });

        toast({
          title: "Usuário criado",
          description: "O usuário foi criado com sucesso.",
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["system-users"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      resetUserForm();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar usuário",
        description: error.message || "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      await queryClient.invalidateQueries({ queryKey: ["system-users"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast({
        title: "Usuário removido",
        description: "O usuário foi excluído com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleUserInputChange = (field: keyof User, value: string | string[]) => {
    setUserFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role: string) => {
    const normalizedRole = normalizeRoleLabel(role);
    setUserFormData((prev) => ({
      ...prev,
      role: normalizedRole,
      permissions: getDefaultPermissionsForRole(normalizedRole),
    }));
  };

  const handlePermissionChange = (permission: PermissionKey, checked: boolean) => {
    setUserFormData((prev) => {
      const next = checked
        ? Array.from(new Set([...prev.permissions, permission]))
        : prev.permissions.filter((p) => p !== permission);
      return { ...prev, permissions: next };
    });
  };

  const handleSelectAllPermissions = () => {
    setUserFormData((prev) => ({
      ...prev,
      permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
    }));
  };

  const handleClearPermissions = () => {
    setUserFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const totalUsers = users.length;
  const totalUsersPages = Math.max(1, Math.ceil(totalUsers / usersPerPage));
  const usersStartIndex = (usersPage - 1) * usersPerPage;
  const usersEndIndex = usersStartIndex + usersPerPage;
  const currentUsers = users.slice(usersStartIndex, usersEndIndex);

  return {
    users,
    loading,
    currentUserId: currentUser?.id,
    usersPage,
    setUsersPage,
    usersPerPage,
    setUsersPerPage,
    showUserForm,
    setShowUserForm,
    editingUser,
    userFormData,
    userToDelete,
    setUserToDelete,
    handleOpenNewUser,
    handleEditUser,
    handleUserSubmit,
    confirmDeleteUser,
    resetUserForm,
    handleUserInputChange,
    handleRoleChange,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleClearPermissions,
    totalUsers,
    totalUsersPages,
    usersStartIndex,
    usersEndIndex,
    currentUsers,
  };
};

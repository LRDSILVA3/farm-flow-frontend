import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import { PermissionKey, ROLE_OPTIONS, ROLE_DEFAULT_PERMISSIONS } from "@/constants/permissions";

export interface Position {
  id: string;
  name: string;
  status: "Ativo" | "Inativo";
  permissions: PermissionKey[];
  isDefault?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const usePositions = () => {
  const { toast } = useToast();
  const queryClient = useSafeQueryClient();

  const { data: positions = [], isLoading: loading, refetch } = useQuery<Position[]>({
    queryKey: ["user-positions"],
    queryFn: async () => {
      let list: Position[] = [];
      try {
        const res = await api.get<any[]>("/positions");
        if (Array.isArray(res)) {
          list = res.map((p) => ({
            ...p,
            id: String(p.id),
            status: p.status === false || p.status === "Inativo" ? "Inativo" : "Ativo",
            permissions: Array.isArray(p.permissions) ? p.permissions : [],
          }));
        }
      } catch (err) {
        console.warn("Falha ao carregar cargos do backend, usando predefinições:", err);
      }

      // Garante que todos os cargos padrão do sistema sempre existam na lista
      ROLE_OPTIONS.forEach((roleName) => {
        const exists = list.some(
          (p) => p.name.trim().toLowerCase() === roleName.toLowerCase()
        );
        if (!exists) {
          list.push({
            id: `default-${roleName}`,
            name: roleName,
            status: "Ativo",
            permissions: ROLE_DEFAULT_PERMISSIONS[roleName] || ["dashboard:view"],
            isDefault: true,
          });
        }
      });

      return list.sort((a, b) => a.name.localeCompare(b.name));
    },
  }, queryClient);

  const [saving, setSaving] = useState(false);

  const savePosition = async (data: { id?: string; name: string; status: "Ativo" | "Inativo"; permissions: PermissionKey[] }) => {
    setSaving(true);
    try {
      const isDefaultMockId = !data.id || String(data.id).startsWith("default-");
      if (!isDefaultMockId) {
        await api.put(`/positions/${data.id}`, {
          name: data.name.trim(),
          status: data.status,
          permissions: data.permissions,
        });
        toast({
          title: "Cargo atualizado",
          description: `O cargo "${data.name}" foi atualizado com sucesso.`,
        });
      } else {
        await api.post("/positions", {
          name: data.name.trim(),
          status: data.status,
          permissions: data.permissions,
        });
        toast({
          title: "Cargo configurado",
          description: `O cargo "${data.name}" foi salvo com sucesso.`,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["user-positions"] });
      return true;
    } catch (err: any) {
      toast({
        title: "Erro ao salvar cargo",
        description: err.message || "Não foi possível salvar o cargo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deletePosition = async (id: string, name: string) => {
    if (String(id).startsWith("default-")) {
      toast({
        title: "Cargo padrão",
        description: `O cargo "${name}" é nativo do sistema e não pode ser excluído.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      await api.delete(`/positions/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["user-positions"] });
      toast({
        title: "Cargo removido",
        description: `O cargo "${name}" foi excluído com sucesso.`,
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Erro ao excluir cargo",
        description: err.message || "Não foi possível excluir o cargo.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    positions,
    loading,
    saving,
    savePosition,
    deletePosition,
    refetch,
  };
};

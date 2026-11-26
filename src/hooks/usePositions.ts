import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import { PermissionKey } from "@/constants/permissions";

export interface Position {
  id: string;
  name: string;
  status: "Ativo" | "Inativo";
  permissions: PermissionKey[];
  created_at?: string;
  updated_at?: string;
}

export const usePositions = () => {
  const { toast } = useToast();
  const queryClient = useSafeQueryClient();

  const { data: positions = [], isLoading: loading, refetch } = useQuery<Position[]>({
    queryKey: ["user-positions"],
    queryFn: async () => {
      try {
        const res = await api.get<Position[]>("/positions");
        if (Array.isArray(res)) {
          return res.map((p) => ({
            ...p,
            status: p.status === "Inativo" ? "Inativo" : "Ativo",
            permissions: Array.isArray(p.permissions) ? p.permissions : [],
          }));
        }
        return [];
      } catch (err) {
        console.warn("Falha ao carregar cargos do backend:", err);
        return [];
      }
    },
  }, queryClient);

  const [saving, setSaving] = useState(false);

  const savePosition = async (data: { id?: string; name: string; status: "Ativo" | "Inativo"; permissions: PermissionKey[] }) => {
    setSaving(true);
    try {
      if (data.id) {
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
          title: "Cargo criado",
          description: `O cargo "${data.name}" foi cadastrado com sucesso.`,
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

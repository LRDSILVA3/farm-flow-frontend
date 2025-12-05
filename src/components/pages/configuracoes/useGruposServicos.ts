import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GrupoServico {
  id: string;
  nome: string;
  descricao: string;
  servicosIds: string[];
  status: string;
}

export const useGruposServicos = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [gruposServicos, setGruposServicos] = useState<GrupoServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [gruposServicosPage, setGruposServicosPage] = useState(1);
  const [gruposServicosPerPage, setGruposServicosPerPage] = useState(10);
  const [showGrupoServicoForm, setShowGrupoServicoForm] = useState(false);
  const [editingGrupoServico, setEditingGrupoServico] = useState<GrupoServico | null>(null);
  const [grupoServicoFormData, setGrupoServicoFormData] = useState<GrupoServico>({
    id: "",
    nome: "",
    descricao: "",
    servicosIds: [],
    status: "Ativo"
  });

  const fetchGruposServicos = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("grupos_servicos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar grupos de serviços", description: error.message, variant: "destructive" });
    } else {
      setGruposServicos(data?.map(g => ({
        id: g.id,
        nome: g.nome,
        descricao: g.descricao || "",
        servicosIds: g.servicos_ids || [],
        status: g.status || "Ativo"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGruposServicos();
  }, [user]);

  const handleEditGrupoServico = (grupo: GrupoServico) => {
    setEditingGrupoServico(grupo);
    setGrupoServicoFormData(grupo);
    setShowGrupoServicoForm(true);
  };

  const handleGrupoServicoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingGrupoServico) {
      const { error } = await supabase
        .from("grupos_servicos")
        .update({
          nome: grupoServicoFormData.nome,
          descricao: grupoServicoFormData.descricao,
          servicos_ids: grupoServicoFormData.servicosIds,
          status: grupoServicoFormData.status
        })
        .eq("id", editingGrupoServico.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Grupo atualizado", description: "O grupo de serviços foi atualizado com sucesso." });
        fetchGruposServicos();
      }
    } else {
      const { error } = await supabase
        .from("grupos_servicos")
        .insert({
          user_id: user.id,
          nome: grupoServicoFormData.nome,
          descricao: grupoServicoFormData.descricao,
          servicos_ids: grupoServicoFormData.servicosIds,
          status: grupoServicoFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Grupo criado", description: "O grupo de serviços foi criado com sucesso." });
        fetchGruposServicos();
      }
    }

    resetGrupoServicoForm();
  };

  const resetGrupoServicoForm = () => {
    setGrupoServicoFormData({
      id: "",
      nome: "",
      descricao: "",
      servicosIds: [],
      status: "Ativo"
    });
    setEditingGrupoServico(null);
    setShowGrupoServicoForm(false);
  };

  const handleGrupoServicoInputChange = (field: keyof GrupoServico, value: string | string[]) => {
    setGrupoServicoFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalGruposServicos = gruposServicos.length;
  const totalGruposServicosPages = Math.ceil(totalGruposServicos / gruposServicosPerPage);
  const gruposServicosStartIndex = (gruposServicosPage - 1) * gruposServicosPerPage;
  const gruposServicosEndIndex = gruposServicosStartIndex + gruposServicosPerPage;
  const currentGruposServicos = gruposServicos.slice(gruposServicosStartIndex, gruposServicosEndIndex);

  return {
    gruposServicos,
    loading,
    gruposServicosPage,
    setGruposServicosPage,
    gruposServicosPerPage,
    setGruposServicosPerPage,
    showGrupoServicoForm,
    setShowGrupoServicoForm,
    editingGrupoServico,
    grupoServicoFormData,
    handleEditGrupoServico,
    handleGrupoServicoSubmit,
    resetGrupoServicoForm,
    handleGrupoServicoInputChange,
    totalGruposServicos,
    totalGruposServicosPages,
    gruposServicosStartIndex,
    gruposServicosEndIndex,
    currentGruposServicos,
    fetchGruposServicos
  };
};

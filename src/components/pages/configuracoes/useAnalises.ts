import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AnaliseConfig {
  id: string;
  nome: string;
  tipo: "Solo" | "Folha";
  colaborador: string;
  prazo: number;
  valor: string;
  status: "Ativo" | "Inativo";
}

export const useAnalises = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [analises, setAnalises] = useState<AnaliseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [analisesPage, setAnalisesPage] = useState(1);
  const [analisesPerPage, setAnalisesPerPage] = useState(10);
  const [showAnaliseForm, setShowAnaliseForm] = useState(false);
  const [editingAnalise, setEditingAnalise] = useState<AnaliseConfig | null>(null);
  const [analiseFormData, setAnaliseFormData] = useState<AnaliseConfig>({
    id: "",
    nome: "",
    tipo: "Solo",
    colaborador: "",
    prazo: 0,
    valor: "",
    status: "Ativo"
  });

  const fetchAnalises = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("analises")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar análises", description: error.message, variant: "destructive" });
    } else {
      setAnalises(data?.map(a => ({
        id: a.id,
        nome: a.nome,
        tipo: (a.tipo as "Solo" | "Folha") || "Solo",
        colaborador: a.colaborador || "",
        prazo: a.prazo || 0,
        valor: a.valor || "",
        status: (a.status as "Ativo" | "Inativo") || "Ativo"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalises();
  }, [user]);

  const handleAnaliseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingAnalise) {
      const { error } = await supabase
        .from("analises")
        .update({
          nome: analiseFormData.nome,
          tipo: analiseFormData.tipo,
          colaborador: analiseFormData.colaborador,
          prazo: analiseFormData.prazo,
          valor: analiseFormData.valor,
          status: analiseFormData.status
        })
        .eq("id", editingAnalise.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Análise atualizada", description: "A análise foi atualizada com sucesso." });
        fetchAnalises();
      }
    } else {
      const { error } = await supabase
        .from("analises")
        .insert({
          user_id: user.id,
          nome: analiseFormData.nome,
          tipo: analiseFormData.tipo,
          colaborador: analiseFormData.colaborador,
          prazo: analiseFormData.prazo,
          valor: analiseFormData.valor,
          status: analiseFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Análise criada", description: "A análise foi criada com sucesso." });
        fetchAnalises();
      }
    }

    resetAnaliseForm();
  };

  const resetAnaliseForm = () => {
    setAnaliseFormData({
      id: "",
      nome: "",
      tipo: "Solo",
      colaborador: "",
      prazo: 0,
      valor: "",
      status: "Ativo"
    });
    setEditingAnalise(null);
    setShowAnaliseForm(false);
  };

  const handleDeleteAnalise = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("analises")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Análise excluída", description: "A análise foi excluída com sucesso." });
      fetchAnalises();
    }
  };

  const handleAnaliseInputChange = (field: keyof AnaliseConfig, value: string | number) => {
    setAnaliseFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalAnalises = analises.length;
  const totalAnalisesPages = Math.ceil(totalAnalises / analisesPerPage);
  const analisesStartIndex = (analisesPage - 1) * analisesPerPage;
  const analisesEndIndex = analisesStartIndex + analisesPerPage;
  const currentAnalises = analises.slice(analisesStartIndex, analisesEndIndex);

  return {
    analises,
    loading,
    analisesPage,
    setAnalisesPage,
    analisesPerPage,
    setAnalisesPerPage,
    showAnaliseForm,
    setShowAnaliseForm,
    editingAnalise,
    setEditingAnalise,
    analiseFormData,
    setAnaliseFormData,
    handleAnaliseSubmit,
    resetAnaliseForm,
    handleAnaliseInputChange,
    handleDeleteAnalise,
    totalAnalises,
    totalAnalisesPages,
    analisesStartIndex,
    analisesEndIndex,
    currentAnalises,
    fetchAnalises
  };
};

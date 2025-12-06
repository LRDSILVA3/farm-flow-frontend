import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Colaborador {
  id: string;
  nome: string;
  endereco: string;
  status: "Ativo" | "Inativo";
}

export const useColaboradores = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [colaboradoresPage, setColaboradoresPage] = useState(1);
  const [colaboradoresPerPage, setColaboradoresPerPage] = useState(10);
  const [showColaboradorForm, setShowColaboradorForm] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [colaboradorFormData, setColaboradorFormData] = useState<Colaborador>({
    id: "",
    nome: "",
    endereco: "",
    status: "Ativo"
  });

  const fetchColaboradores = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("colaboradores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar colaboradores", description: error.message, variant: "destructive" });
    } else {
      setColaboradores(data?.map(c => ({
        id: c.id,
        nome: c.nome,
        endereco: c.endereco || "",
        status: (c.status as "Ativo" | "Inativo") || "Ativo"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchColaboradores();
  }, [user]);

  const handleColaboradorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingColaborador) {
      const { error } = await supabase
        .from("colaboradores")
        .update({
          nome: colaboradorFormData.nome,
          endereco: colaboradorFormData.endereco,
          status: colaboradorFormData.status
        })
        .eq("id", editingColaborador.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Colaborador atualizado", description: "O colaborador foi atualizado com sucesso." });
        fetchColaboradores();
      }
    } else {
      const { error } = await supabase
        .from("colaboradores")
        .insert({
          user_id: user.id,
          nome: colaboradorFormData.nome,
          endereco: colaboradorFormData.endereco,
          status: colaboradorFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Colaborador criado", description: "O colaborador foi criado com sucesso." });
        fetchColaboradores();
      }
    }

    resetColaboradorForm();
  };

  const resetColaboradorForm = () => {
    setColaboradorFormData({
      id: "",
      nome: "",
      endereco: "",
      status: "Ativo"
    });
    setEditingColaborador(null);
    setShowColaboradorForm(false);
  };

  const handleDeleteColaborador = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("colaboradores")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Colaborador excluído", description: "O colaborador foi excluído com sucesso." });
      fetchColaboradores();
    }
  };

  const handleColaboradorInputChange = (field: keyof Colaborador, value: string) => {
    setColaboradorFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalColaboradores = colaboradores.length;
  const totalColaboradoresPages = Math.ceil(totalColaboradores / colaboradoresPerPage);
  const colaboradoresStartIndex = (colaboradoresPage - 1) * colaboradoresPerPage;
  const colaboradoresEndIndex = colaboradoresStartIndex + colaboradoresPerPage;
  const currentColaboradores = colaboradores.slice(colaboradoresStartIndex, colaboradoresEndIndex);

  return {
    colaboradores,
    loading,
    colaboradoresPage,
    setColaboradoresPage,
    colaboradoresPerPage,
    setColaboradoresPerPage,
    showColaboradorForm,
    setShowColaboradorForm,
    editingColaborador,
    setEditingColaborador,
    colaboradorFormData,
    setColaboradorFormData,
    handleColaboradorSubmit,
    resetColaboradorForm,
    handleColaboradorInputChange,
    handleDeleteColaborador,
    totalColaboradores,
    totalColaboradoresPages,
    colaboradoresStartIndex,
    colaboradoresEndIndex,
    currentColaboradores,
    fetchColaboradores
  };
};

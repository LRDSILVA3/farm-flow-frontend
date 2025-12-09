import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface VariavelCusto {
  id: string;
  nome: string;
  codigo: string;
  valor: number;
  descricao: string;
}

export const useVariaveisCusto = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [variaveis, setVariaveis] = useState<VariavelCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [variaveisPage, setVariaveisPage] = useState(1);
  const [variaveisPerPage, setVariaveisPerPage] = useState(10);
  const [showVariavelForm, setShowVariavelForm] = useState(false);
  const [editingVariavel, setEditingVariavel] = useState<VariavelCusto | null>(null);
  const [variavelFormData, setVariavelFormData] = useState<VariavelCusto>({
    id: "",
    nome: "",
    codigo: "",
    valor: 0,
    descricao: ""
  });

  const fetchVariaveis = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("variaveis_custo")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar variáveis", description: error.message, variant: "destructive" });
    } else {
      setVariaveis(data?.map(v => ({
        id: v.id,
        nome: v.nome,
        codigo: v.codigo,
        valor: Number(v.valor) || 0,
        descricao: v.descricao || ""
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVariaveis();
  }, [user]);

  const handleEditVariavel = (variavel: VariavelCusto) => {
    setEditingVariavel(variavel);
    setVariavelFormData(variavel);
    setShowVariavelForm(true);
  };

  const handleVariavelSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingVariavel) {
      const { error } = await supabase
        .from("variaveis_custo")
        .update({
          nome: variavelFormData.nome,
          codigo: variavelFormData.codigo,
          valor: variavelFormData.valor,
          descricao: variavelFormData.descricao
        })
        .eq("id", editingVariavel.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Variável atualizada", description: "A variável foi atualizada com sucesso." });
        fetchVariaveis();
      }
    } else {
      const { error } = await supabase
        .from("variaveis_custo")
        .insert({
          user_id: user.id,
          nome: variavelFormData.nome,
          codigo: variavelFormData.codigo,
          valor: variavelFormData.valor,
          descricao: variavelFormData.descricao
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Variável criada", description: "A variável foi criada com sucesso." });
        fetchVariaveis();
      }
    }

    resetVariavelForm();
  };

  const resetVariavelForm = () => {
    setVariavelFormData({
      id: "",
      nome: "",
      codigo: "",
      valor: 0,
      descricao: ""
    });
    setEditingVariavel(null);
    setShowVariavelForm(false);
  };

  const handleDeleteVariavel = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("variaveis_custo")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Variável excluída", description: "A variável foi excluída com sucesso." });
      fetchVariaveis();
    }
  };

  const handleVariavelInputChange = (field: keyof VariavelCusto, value: string | number) => {
    setVariavelFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalVariaveis = variaveis.length;
  const totalVariaveisPages = Math.ceil(totalVariaveis / variaveisPerPage);
  const variaveisStartIndex = (variaveisPage - 1) * variaveisPerPage;
  const variaveisEndIndex = variaveisStartIndex + variaveisPerPage;
  const currentVariaveis = variaveis.slice(variaveisStartIndex, variaveisEndIndex);

  return {
    variaveis,
    loading,
    variaveisPage,
    setVariaveisPage,
    variaveisPerPage,
    setVariaveisPerPage,
    showVariavelForm,
    setShowVariavelForm,
    editingVariavel,
    variavelFormData,
    handleEditVariavel,
    handleVariavelSubmit,
    resetVariavelForm,
    handleVariavelInputChange,
    handleDeleteVariavel,
    totalVariaveis,
    totalVariaveisPages,
    variaveisStartIndex,
    variaveisEndIndex,
    currentVariaveis,
    fetchVariaveis
  };
};

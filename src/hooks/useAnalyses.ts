import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Analysis {
  id: string;
  name: string;
  type: "Soil" | "Leaf";
  collaborator: string;
  deadline: number;
  value: string;
  status: "Active" | "Inactive";
}

export const useAnalyses = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [analysesPerPage, setAnalysesPerPage] = useState(10);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<Analysis | null>(null);
  const [analysisFormData, setAnalysisFormData] = useState<Analysis>({
    id: "",
    name: "",
    type: "Soil",
    collaborator: "",
    deadline: 0,
    value: "",
    status: "Active"
  });

  const fetchAnalyses = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar análises", description: error.message, variant: "destructive" });
    } else {
      setAnalyses(data?.map(a => ({
        id: a.id,
        name: a.name,
        type: (a.type as "Soil" | "Leaf") || "Soil",
        collaborator: a.collaborator || "",
        deadline: a.deadline || 0,
        value: a.value || "",
        status: (a.status as "Active" | "Inactive") || "Active"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  const handleAnalysisSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingAnalysis) {
      const { error } = await supabase
        .from("analyses")
        .update({
          name: analysisFormData.name,
          type: analysisFormData.type,
          collaborator: analysisFormData.collaborator,
          deadline: analysisFormData.deadline,
          value: analysisFormData.value,
          status: analysisFormData.status
        })
        .eq("id", editingAnalysis.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Análise atualizada", description: "A análise foi atualizada com sucesso." });
        fetchAnalyses();
      }
    } else {
      const { error } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          name: analysisFormData.name,
          type: analysisFormData.type,
          collaborator: analysisFormData.collaborator,
          deadline: analysisFormData.deadline,
          value: analysisFormData.value,
          status: analysisFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Análise criada", description: "A análise foi criada com sucesso." });
        fetchAnalyses();
      }
    }

    resetAnalysisForm();
  };

  const resetAnalysisForm = () => {
    setAnalysisFormData({
      id: "",
      name: "",
      type: "Solo",
      collaborator: "",
      deadline: 0,
      value: "",
      status: "Ativo"
    });
    setEditingAnalysis(null);
    setShowAnalysisForm(false);
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Análise excluída", description: "A análise foi excluída com sucesso." });
      fetchAnalyses();
    }
  };

  const handleAnalysisInputChange = (field: keyof Analysis, value: string | number) => {
    setAnalysisFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalAnalyses = analyses.length;
  const totalAnalysesPages = Math.ceil(totalAnalyses / analysesPerPage);
  const analysesStartIndex = (analysesPage - 1) * analysesPerPage;
  const analysesEndIndex = analysesStartIndex + analysesPerPage;
  const currentAnalyses = analyses.slice(analysesStartIndex, analysesEndIndex);

  return {
    analyses,
    loading,
    analysesPage,
    setAnalysesPage,
    analysesPerPage,
    setAnalysesPerPage,
    showAnalysisForm,
    setShowAnalysisForm,
    editingAnalysis,
    setEditingAnalysis,
    analysisFormData,
    setAnalysisFormData,
    handleAnalysisSubmit,
    resetAnalysisForm,
    handleAnalysisInputChange,
    handleDeleteAnalysis,
    totalAnalyses,
    totalAnalysesPages,
    analysesStartIndex,
    analysesEndIndex,
    currentAnalyses,
    fetchAnalyses
  };
};

import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

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
    setLoading(true);
    try {
      const data = await api.get<any[]>('/analyses');
      if (Array.isArray(data)) {
        setAnalyses(data.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type || "Soil",
          collaborator: a.collaborator || "",
          deadline: a.deadline || 0,
          value: a.value ? String(a.value) : "0,00",
          status: a.status || "Active"
        })));
      }
    } catch (error: any) {
      toast({ title: "Erro ao carregar análises", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleInputChange = (field: keyof Analysis, value: any) => {
    setAnalysisFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAnalysis = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnalysis) {
        await api.put(`/analyses/${editingAnalysis.id}`, analysisFormData);
        toast({ title: "Análise atualizada", description: "Dados atualizados com sucesso." });
      } else {
        await api.post('/analyses', analysisFormData);
        toast({ title: "Análise cadastrada", description: "Análise adicionada com sucesso." });
      }
      setShowAnalysisForm(false);
      setEditingAnalysis(null);
      setAnalysisFormData({ id: "", name: "", type: "Soil", collaborator: "", deadline: 0, value: "", status: "Active" });
      await fetchAnalyses();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleEditAnalysis = (item: Analysis) => {
    setEditingAnalysis(item);
    setAnalysisFormData(item);
    setShowAnalysisForm(true);
  };

  const handleDeleteAnalysis = async (id: string) => {
    try {
      await api.delete(`/analyses/${id}`);
      toast({ title: "Análise removida", description: "Excluída com sucesso." });
      await fetchAnalyses();
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

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
    analysisFormData,
    handleInputChange,
    handleSaveAnalysis,
    handleEditAnalysis,
    handleDeleteAnalysis,
    refetch: fetchAnalyses
  };
};

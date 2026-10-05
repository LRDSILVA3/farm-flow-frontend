import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface CostVariable {
  id: string;
  name: string;
  code: string;
  value: number;
  description: string;
  linkedServices?: string[];
}

export const useCostVariables = () => {
  const { toast } = useToast();
  
  const [costVariables, setCostVariables] = useState<CostVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [costVariablesPage, setCostVariablesPage] = useState(1);
  const [costVariablesPerPage, setCostVariablesPerPage] = useState(10);
  const [showCostVariableForm, setShowCostVariableForm] = useState(false);
  const [editingCostVariable, setEditingCostVariable] = useState<CostVariable | null>(null);
  const [costVariableFormData, setCostVariableFormData] = useState<CostVariable>({
    id: "",
    name: "",
    code: "",
    value: 0,
    description: "",
    linkedServices: []
  });

  const fetchCostVariables = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/cost-variables');
      if (Array.isArray(data)) {
        setCostVariables(data.map(c => ({
          id: c.id,
          name: c.name,
          code: c.code || "",
          value: Number(c.value || 0),
          description: c.description || "",
          linkedServices: c.linked_services || c.linkedServices || []
        })));
      }
    } catch (err: any) {
      toast({ title: "Erro ao carregar variáveis", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostVariables();
  }, []);

  const handleEditCostVariable = (variable: CostVariable) => {
    setEditingCostVariable(variable);
    setCostVariableFormData(variable);
    setShowCostVariableForm(true);
  };

  const handleCostVariableSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: costVariableFormData.name,
        code: costVariableFormData.code,
        value: costVariableFormData.value,
        description: costVariableFormData.description,
        linked_services: costVariableFormData.linkedServices
      };

      if (editingCostVariable) {
        await api.put(`/cost-variables/${editingCostVariable.id}`, payload);
        toast({ title: "Variável atualizada", description: "A variável foi atualizada com sucesso." });
      } else {
        await api.post('/cost-variables', payload);
        toast({ title: "Variável criada", description: "A variável foi criada com sucesso." });
      }
      fetchCostVariables();
      resetCostVariableForm();
    } catch (err: any) {
      toast({ title: "Erro ao salvar variável", description: err.message, variant: "destructive" });
    }
  };

  const resetCostVariableForm = () => {
    setCostVariableFormData({
      id: "",
      name: "",
      code: "",
      value: 0,
      description: "",
      linkedServices: []
    });
    setEditingCostVariable(null);
    setShowCostVariableForm(false);
  };

  const handleDeleteCostVariable = async (id: string) => {
    try {
      await api.delete(`/cost-variables/${id}`);
      toast({ title: "Variável excluída", description: "A variável foi excluída com sucesso." });
      fetchCostVariables();
    } catch (err: any) {
      toast({ title: "Erro ao excluir variável", description: err.message, variant: "destructive" });
    }
  };

  const handleCostVariableInputChange = (field: keyof CostVariable, value: string | number) => {
    setCostVariableFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalCostVariables = costVariables.length;
  const totalCostVariablesPages = Math.ceil(totalCostVariables / costVariablesPerPage);
  const costVariablesStartIndex = (costVariablesPage - 1) * costVariablesPerPage;
  const costVariablesEndIndex = costVariablesStartIndex + costVariablesPerPage;
  const currentCostVariables = costVariables.slice(costVariablesStartIndex, costVariablesEndIndex);

  return {
    costVariables,
    loading,
    costVariablesPage,
    setCostVariablesPage,
    costVariablesPerPage,
    setCostVariablesPerPage,
    showCostVariableForm,
    setShowCostVariableForm,
    editingCostVariable,
    costVariableFormData,
    handleEditCostVariable,
    handleCostVariableSubmit,
    resetCostVariableForm,
    handleCostVariableInputChange,
    handleDeleteCostVariable,
    totalCostVariables,
    totalCostVariablesPages,
    costVariablesStartIndex,
    costVariablesEndIndex,
    currentCostVariables,
    fetchCostVariables
  };
};

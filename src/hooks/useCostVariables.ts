import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CostVariable {
  id: string;
  name: string;
  code: string;
  value: number;
  description: string;
  linkedServices: { id: string; name: string }[];
}

export const useCostVariables = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    if (!user) return;
    
    setLoading(true);

    const [varsResult, linksResult] = await Promise.all([
      supabase.from("cost_variables").select("*").order("created_at", { ascending: false }),
      supabase.from("service_variables").select("variable_id, service_id, services(name)")
    ]);

    if (varsResult.error) {
      toast({ title: "Erro ao carregar variáveis", description: varsResult.error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const serviceMap = new Map<string, { id: string; name: string }[]>();
    if (linksResult.data) {
      for (const link of linksResult.data) {
        const serviceName = (link as any).services?.name || "Desconhecido";
        if (!serviceMap.has(link.variable_id)) {
          serviceMap.set(link.variable_id, []);
        }
        serviceMap.get(link.variable_id)!.push({ id: link.service_id, name: serviceName });
      }
    }

    setCostVariables(varsResult.data?.map(v => ({
      id: v.id,
      name: v.name,
      code: v.code,
      value: Number(v.value) || 0,
      description: v.description || "",
      linkedServices: serviceMap.get(v.id) || []
    })) || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchCostVariables();
  }, [user]);

  const handleEditCostVariable = (variable: CostVariable) => {
    setEditingCostVariable(variable);
    setCostVariableFormData(variable);
    setShowCostVariableForm(true);
  };

  const handleCostVariableSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingCostVariable) {
      const { error } = await supabase
        .from("cost_variables")
        .update({
          name: costVariableFormData.name,
          code: costVariableFormData.code,
          value: costVariableFormData.value,
          description: costVariableFormData.description
        })
        .eq("id", editingCostVariable.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Variável atualizada", description: "A variável foi atualizada com sucesso." });
        fetchCostVariables();
      }
    } else {
      const { error } = await supabase
        .from("cost_variables")
        .insert({
          user_id: user.id,
          name: costVariableFormData.name,
          code: costVariableFormData.code,
          value: costVariableFormData.value,
          description: costVariableFormData.description
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Variável criada", description: "A variável foi criada com sucesso." });
        fetchCostVariables();
      }
    }

    resetCostVariableForm();
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
    if (!user) return;

    const { error } = await supabase
      .from("cost_variables")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Variável excluída", description: "A variável foi excluída com sucesso." });
      fetchCostVariables();
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

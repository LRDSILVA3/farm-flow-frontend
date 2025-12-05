import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Equipamento {
  id: string;
  nome: string;
  status: string;
}

export const useEquipamentos = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipamentosPage, setEquipamentosPage] = useState(1);
  const [equipamentosPerPage, setEquipamentosPerPage] = useState(10);
  const [showEquipamentoForm, setShowEquipamentoForm] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);
  const [equipamentoFormData, setEquipamentoFormData] = useState<Equipamento>({
    id: "",
    nome: "",
    status: "Disponível"
  });

  const fetchEquipamentos = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("equipamentos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar equipamentos", description: error.message, variant: "destructive" });
    } else {
      setEquipamentos(data?.map(e => ({
        id: e.id,
        nome: e.nome,
        status: e.status || "Disponível"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipamentos();
  }, [user]);

  const handleEditEquipamento = (equipamento: Equipamento) => {
    setEditingEquipamento(equipamento);
    setEquipamentoFormData(equipamento);
    setShowEquipamentoForm(true);
  };

  const handleEquipamentoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingEquipamento) {
      const { error } = await supabase
        .from("equipamentos")
        .update({
          nome: equipamentoFormData.nome,
          status: equipamentoFormData.status
        })
        .eq("id", editingEquipamento.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Equipamento atualizado", description: "O equipamento foi atualizado com sucesso." });
        fetchEquipamentos();
      }
    } else {
      const { error } = await supabase
        .from("equipamentos")
        .insert({
          user_id: user.id,
          nome: equipamentoFormData.nome,
          status: equipamentoFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Equipamento criado", description: "O equipamento foi criado com sucesso." });
        fetchEquipamentos();
      }
    }

    resetEquipamentoForm();
  };

  const resetEquipamentoForm = () => {
    setEquipamentoFormData({
      id: "",
      nome: "",
      status: "Disponível"
    });
    setEditingEquipamento(null);
    setShowEquipamentoForm(false);
  };

  const handleEquipamentoInputChange = (field: keyof Equipamento, value: string) => {
    setEquipamentoFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalEquipamentos = equipamentos.length;
  const totalEquipamentosPages = Math.ceil(totalEquipamentos / equipamentosPerPage);
  const equipamentosStartIndex = (equipamentosPage - 1) * equipamentosPerPage;
  const equipamentosEndIndex = equipamentosStartIndex + equipamentosPerPage;
  const currentEquipamentos = equipamentos.slice(equipamentosStartIndex, equipamentosEndIndex);

  return {
    equipamentos,
    loading,
    equipamentosPage,
    setEquipamentosPage,
    equipamentosPerPage,
    setEquipamentosPerPage,
    showEquipamentoForm,
    setShowEquipamentoForm,
    editingEquipamento,
    equipamentoFormData,
    handleEditEquipamento,
    handleEquipamentoSubmit,
    resetEquipamentoForm,
    handleEquipamentoInputChange,
    totalEquipamentos,
    totalEquipamentosPages,
    equipamentosStartIndex,
    equipamentosEndIndex,
    currentEquipamentos,
    fetchEquipamentos
  };
};

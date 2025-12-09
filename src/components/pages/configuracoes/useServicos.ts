import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Servico {
  id: string;
  nome: string;
  valorAlqueire: string;
  status: string;
  produtos: string;
  isFixed: boolean;
}

export const useServicos = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicosPage, setServicosPage] = useState(1);
  const [servicosPerPage, setServicosPerPage] = useState(10);
  const [showServicoForm, setShowServicoForm] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [servicoFormData, setServicoFormData] = useState<Servico>({
    id: "",
    nome: "",
    valorAlqueire: "",
    status: "Ativo",
    produtos: "",
    isFixed: false
  });

  const fetchServicos = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar serviços", description: error.message, variant: "destructive" });
    } else {
      setServicos(data?.map(s => ({
        id: s.id,
        nome: s.nome,
        valorAlqueire: s.valor_alqueire || "",
        status: s.status || "Ativo",
        produtos: s.produtos || "",
        isFixed: s.is_fixed || false
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServicos();
  }, [user]);

  const handleEditServico = (servico: Servico) => {
    setEditingServico(servico);
    setServicoFormData(servico);
    setShowServicoForm(true);
  };

  const handleServicoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingServico) {
      const { error } = await supabase
        .from("servicos")
        .update({
          nome: servicoFormData.nome,
          valor_alqueire: servicoFormData.valorAlqueire,
          status: servicoFormData.status,
          produtos: servicoFormData.produtos
        })
        .eq("id", editingServico.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Serviço atualizado", description: "O serviço foi atualizado com sucesso." });
        fetchServicos();
      }
    } else {
      const { error } = await supabase
        .from("servicos")
        .insert({
          user_id: user.id,
          nome: servicoFormData.nome,
          valor_alqueire: servicoFormData.valorAlqueire,
          status: servicoFormData.status,
          produtos: servicoFormData.produtos
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Serviço criado", description: "O serviço foi criado com sucesso." });
        fetchServicos();
      }
    }

    resetServicoForm();
  };

  const resetServicoForm = () => {
    setServicoFormData({
      id: "",
      nome: "",
      valorAlqueire: "",
      status: "Ativo",
      produtos: "",
      isFixed: false
    });
    setEditingServico(null);
    setShowServicoForm(false);
  };

  const handleDeleteServico = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("servicos")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Serviço excluído", description: "O serviço foi excluído com sucesso." });
      fetchServicos();
    }
  };

  const handleServicoInputChange = (field: keyof Servico, value: string) => {
    setServicoFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalServicos = servicos.length;
  const totalServicosPages = Math.ceil(totalServicos / servicosPerPage);
  const servicosStartIndex = (servicosPage - 1) * servicosPerPage;
  const servicosEndIndex = servicosStartIndex + servicosPerPage;
  const currentServicos = servicos.slice(servicosStartIndex, servicosEndIndex);

  return {
    servicos,
    loading,
    servicosPage,
    setServicosPage,
    servicosPerPage,
    setServicosPerPage,
    showServicoForm,
    setShowServicoForm,
    editingServico,
    servicoFormData,
    handleEditServico,
    handleServicoSubmit,
    resetServicoForm,
    handleServicoInputChange,
    handleDeleteServico,
    totalServicos,
    totalServicosPages,
    servicosStartIndex,
    servicosEndIndex,
    currentServicos,
    fetchServicos
  };
};

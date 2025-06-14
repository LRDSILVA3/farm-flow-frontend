import { useState, useEffect } from "react";
import { Talhao } from "../FazendasPage";
import { useToast } from "@/hooks/use-toast";

export const useTalhoesModal = (
  onAddTalhao: (fazendaId: string) => void,
  talhaoForm: Talhao,
  setTalhaoForm: (talhao: Talhao) => void,
  autoOpenForm?: boolean
) => {
  const [showTalhaoForm, setShowTalhaoForm] = useState(false);
  const [editingTalhao, setEditingTalhao] = useState<Talhao | null>(null);
  const { toast } = useToast();

  // Abre automaticamente o formulário se solicitado
  useEffect(() => {
    if (autoOpenForm) {
      setShowTalhaoForm(true);
    }
  }, [autoOpenForm]);

  const handleAddTalhao = (e: React.FormEvent, fazendaId: string) => {
    e.preventDefault();
    onAddTalhao(fazendaId);
    resetForm();
  };

  const handleEditTalhao = (talhao: Talhao) => {
    setEditingTalhao(talhao);
    setTalhaoForm(talhao);
    setShowTalhaoForm(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setTalhaoForm({
      id: "",
      nome: "",
      area: "",
      status: "Ativo",
      cidade: "",
      estado: "",
      matricula: "",
      lote: ""
    });
    setShowTalhaoForm(false);
    setEditingTalhao(null);
  };

  return {
    showTalhaoForm,
    setShowTalhaoForm,
    editingTalhao,
    handleAddTalhao,
    handleEditTalhao,
    handleCancel
  };
};

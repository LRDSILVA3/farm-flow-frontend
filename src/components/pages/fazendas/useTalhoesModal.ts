
import { useState } from "react";
import { Talhao } from "../FazendasPage";
import { useToast } from "@/hooks/use-toast";

export const useTalhoesModal = (
  onAddTalhao: (fazendaId: string) => void,
  talhaoForm: Talhao,
  setTalhaoForm: (talhao: Talhao) => void
) => {
  const [showTalhaoForm, setShowTalhaoForm] = useState(false);
  const [editingTalhao, setEditingTalhao] = useState<Talhao | null>(null);
  const { toast } = useToast();

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

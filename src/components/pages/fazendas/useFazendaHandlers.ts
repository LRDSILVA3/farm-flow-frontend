import { useRef, useEffect } from "react";
import { Fazenda, Talhao } from "../FazendasPage";

export const useFazendaHandlers = (
  fazendas: Fazenda[],
  setFazendas: (fazendas: Fazenda[] | ((prev: Fazenda[]) => Fazenda[])) => void,
  setEditingFazenda: (fazenda: Fazenda | null) => void,
  setFormData: (fazenda: Fazenda | ((prev: Fazenda) => Fazenda)) => void,
  setShowFazendaForm: (show: boolean) => void,
  setSelectedFazenda: (fazenda: Fazenda | null | ((prev: Fazenda | null) => Fazenda | null)) => void,
  setShowTalhoesModal: (show: boolean) => void,
  editingFazenda: Fazenda | null,
  formData: Fazenda,
  setTalhaoForm: (talhao: Talhao) => void,
  addFazenda?: (fazenda: Omit<Fazenda, 'id' | 'talhoes'>) => Promise<any>,
  updateFazenda?: (fazenda: Fazenda) => Promise<void>,
  addTalhao?: (fazendaId: string, talhao: Omit<Talhao, 'id'>) => Promise<void>,
  deleteTalhao?: (fazendaId: string, talhaoId: string) => Promise<void>
) => {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleEdit = (fazenda: Fazenda) => {
    setEditingFazenda(fazenda);
    setFormData(fazenda);
    setShowFazendaForm(true);
  };

  const handleViewTalhoes = (fazenda: Fazenda) => {
    setSelectedFazenda(fazenda);
    setShowTalhoesModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFazenda) {
      if (updateFazenda) {
        await updateFazenda(formData);
      }
    } else {
      if (addFazenda) {
        await addFazenda(formData);
      }
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      proprietario: "",
      area: "",
      cidade: "",
      estado: "",
      contato: "",
      status: "Ativo",
      matricula: "",
      lote: "",
      talhoes: []
    });
    setEditingFazenda(null);
    setShowFazendaForm(false);
  };

  const handleInputChange = (field: keyof Fazenda, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTalhao = async (fazendaId: string, talhaoForm: Talhao) => {
    if (addTalhao) {
      await addTalhao(fazendaId, talhaoForm);
    }

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
  };

  const handleDeleteTalhao = async (fazendaId: string, talhaoId: string) => {
    if (deleteTalhao) {
      await deleteTalhao(fazendaId, talhaoId);
    }

    if (editingFazenda && editingFazenda.id === fazendaId) {
      setFormData(prev => ({
        ...prev,
        talhoes: prev.talhoes.filter(t => t.id !== talhaoId)
      }));
    }
  };

  return {
    handleEdit,
    handleViewTalhoes,
    handleSubmit,
    resetForm,
    handleInputChange,
    handleAddTalhao,
    handleDeleteTalhao
  };
};

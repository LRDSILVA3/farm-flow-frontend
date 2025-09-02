
import { useRef, useEffect } from "react";
import { Fazenda, Talhao } from "../FazendasPage";
import { useToast } from "@/hooks/use-toast";

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
  setTalhaoForm: (talhao: Talhao) => void
) => {
  const { toast } = useToast();
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeToast = (toastData: any) => {
    if (isMountedRef.current) {
      toast(toastData);
    }
  };

  const handleEdit = (fazenda: Fazenda) => {
    console.log("Editando fazenda:", fazenda);
    setEditingFazenda(fazenda);
    setFormData(fazenda);
    setShowFazendaForm(true);
  };

  const handleViewTalhoes = (fazenda: Fazenda) => {
    setSelectedFazenda(fazenda);
    setShowTalhoesModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFazenda) {
      setFazendas(prev => prev.map(f => f.id === editingFazenda.id ? formData : f));
      safeToast({
        title: "Fazenda atualizada",
        description: "A fazenda foi atualizada com sucesso.",
      });
    } else {
      const newFazenda = { ...formData, id: Date.now().toString() };
      setFazendas(prev => [...prev, newFazenda]);
      safeToast({
        title: "Fazenda criada",
        description: "A fazenda foi criada com sucesso.",
      });
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

  const handleAddTalhao = (fazendaId: string, talhaoForm: Talhao) => {
    const newTalhao = {
      ...talhaoForm,
      id: Date.now().toString()
    };

    setFazendas(prev => prev.map(fazenda => 
      fazenda.id === fazendaId 
        ? { ...fazenda, talhoes: [...fazenda.talhoes, newTalhao] }
        : fazenda
    ));

    setSelectedFazenda(prev => prev ? {
      ...prev,
      talhoes: [...prev.talhoes, newTalhao]
    } : null);

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

    safeToast({
      title: "Talhão adicionado",
      description: "O talhão foi adicionado com sucesso.",
    });
  };

  const handleDeleteTalhao = (fazendaId: string, talhaoId: string) => {
    setFazendas(prev => prev.map(fazenda => 
      fazenda.id === fazendaId 
        ? { ...fazenda, talhoes: fazenda.talhoes.filter(t => t.id !== talhaoId) }
        : fazenda
    ));

    setSelectedFazenda(prev => prev ? {
      ...prev,
      talhoes: prev.talhoes.filter(t => t.id !== talhaoId)
    } : null);

    if (editingFazenda && editingFazenda.id === fazendaId) {
      setFormData(prev => ({
        ...prev,
        talhoes: prev.talhoes.filter(t => t.id !== talhaoId)
      }));
    }

    safeToast({
      title: "Talhão removido",
      description: "O talhão foi removido com sucesso.",
    });
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

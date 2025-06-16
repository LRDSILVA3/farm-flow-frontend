
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

export interface AnaliseConfig {
  id: string;
  nome: string;
  tipo: "Solo" | "Folha";
  colaborador: string;
  prazo: number;
  valor: string;
  status: "Ativo" | "Inativo";
}

export const useAnalises = () => {
  const { toast } = useToast();
  const [analises, setAnalises] = useState<AnaliseConfig[]>([
    {
      id: "1",
      nome: "Macro",
      tipo: "Solo",
      colaborador: "João Silva",
      prazo: 7,
      valor: "150.00",
      status: "Ativo"
    },
    {
      id: "2",
      nome: "Foliar",
      tipo: "Folha", 
      colaborador: "Maria Santos",
      prazo: 5,
      valor: "120.00",
      status: "Ativo"
    }
  ]);

  const [analisesPage, setAnalisesPage] = useState(1);
  const [analisesPerPage, setAnalisesPerPage] = useState(10);
  const [showAnaliseForm, setShowAnaliseForm] = useState(false);
  const [editingAnalise, setEditingAnalise] = useState<AnaliseConfig | null>(null);
  const [analiseFormData, setAnaliseFormData] = useState<AnaliseConfig>({
    id: "",
    nome: "",
    tipo: "Solo",
    colaborador: "",
    prazo: 0,
    valor: "",
    status: "Ativo"
  });

  const handleAnaliseSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (editingAnalise) {
      setAnalises(prev => prev.map(a => a.id === editingAnalise.id ? analiseFormData : a));
      toast({
        title: "Análise atualizada",
        description: "A análise foi atualizada com sucesso.",
      });
    } else {
      const newAnalise = { ...analiseFormData, id: Date.now().toString() };
      setAnalises(prev => [...prev, newAnalise]);
      toast({
        title: "Análise criada",
        description: "A análise foi criada com sucesso.",
      });
    }
    
    resetAnaliseForm();
  };

  const resetAnaliseForm = () => {
    setAnaliseFormData({
      id: "",
      nome: "",
      tipo: "Solo",
      colaborador: "",
      prazo: 0,
      valor: "",
      status: "Ativo"
    });
    setEditingAnalise(null);
    setShowAnaliseForm(false);
  };

  const handleAnaliseInputChange = (field: keyof AnaliseConfig, value: string | number) => {
    setAnaliseFormData(prev => ({ ...prev, [field]: value }));
  };

  // Pagination logic
  const totalAnalises = analises.length;
  const totalAnalisesPages = Math.ceil(totalAnalises / analisesPerPage);
  const analisesStartIndex = (analisesPage - 1) * analisesPerPage;
  const analisesEndIndex = analisesStartIndex + analisesPerPage;
  const currentAnalises = analises.slice(analisesStartIndex, analisesEndIndex);

  return {
    analises,
    analisesPage,
    setAnalisesPage,
    analisesPerPage,
    setAnalisesPerPage,
    showAnaliseForm,
    setShowAnaliseForm,
    editingAnalise,
    setEditingAnalise,
    analiseFormData,
    setAnaliseFormData,
    handleAnaliseSubmit,
    resetAnaliseForm,
    handleAnaliseInputChange,
    totalAnalises,
    totalAnalisesPages,
    analisesStartIndex,
    analisesEndIndex,
    currentAnalises
  };
};

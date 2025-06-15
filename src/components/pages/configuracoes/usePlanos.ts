
import { useState, FormEvent } from "react";

export interface Plano {
  id: number;
  nome: string;
  descricao: string;
  recorrencia: "mensal" | "unico";
  status: "Ativo" | "Inativo";
  valor: number;
  servicosIds: number[];
  dataCriacao: string;
}

export const usePlanos = () => {
  const [planos] = useState<Plano[]>([
    {
      id: 1,
      nome: "Plano Básico",
      descricao: "Pacote básico de serviços agrícolas",
      recorrencia: "mensal",
      status: "Ativo",
      valor: 299.90,
      servicosIds: [1, 2],
      dataCriacao: "15/01/2024"
    },
    {
      id: 2,
      nome: "Plano Completo",
      descricao: "Pacote completo com todos os serviços",
      recorrencia: "mensal",
      status: "Ativo",
      valor: 599.90,
      servicosIds: [1, 2, 3, 4],
      dataCriacao: "10/01/2024"
    }
  ]);

  // Mock services for selection
  const [servicos] = useState([
    { id: 1, nome: "Pulverização" },
    { id: 2, nome: "Plantio" },
    { id: 3, nome: "Colheita" },
    { id: 4, nome: "Análise de Solo" },
    { id: 5, nome: "Irrigação" }
  ]);

  const [planosPage, setPlanosPage] = useState(1);
  const [planosPerPage, setPlanosPerPage] = useState(10);
  const [showPlanoForm, setShowPlanoForm] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [planoFormData, setPlanoFormData] = useState<Plano>({
    id: 0,
    nome: "",
    descricao: "",
    recorrencia: "mensal",
    status: "Ativo",
    valor: 0,
    servicosIds: [],
    dataCriacao: ""
  });

  // Pagination calculations
  const planosStartIndex = (planosPage - 1) * planosPerPage;
  const planosEndIndex = planosStartIndex + planosPerPage;
  const currentPlanos = planos.slice(planosStartIndex, planosEndIndex);
  const totalPlanos = planos.length;
  const totalPlanosPages = Math.ceil(totalPlanos / planosPerPage);

  const handleEditPlano = (plano: Plano) => {
    setEditingPlano(plano);
    setPlanoFormData(plano);
    setShowPlanoForm(true);
  };

  const handlePlanoSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Plano saved:", planoFormData);
    resetPlanoForm();
  };

  const resetPlanoForm = () => {
    setShowPlanoForm(false);
    setEditingPlano(null);
    setPlanoFormData({
      id: 0,
      nome: "",
      descricao: "",
      recorrencia: "mensal",
      status: "Ativo",
      valor: 0,
      servicosIds: [],
      dataCriacao: ""
    });
  };

  const handlePlanoInputChange = (field: keyof Plano, value: string | number | number[]) => {
    setPlanoFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServicoToggle = (servicoId: number) => {
    setPlanoFormData(prev => ({
      ...prev,
      servicosIds: prev.servicosIds.includes(servicoId)
        ? prev.servicosIds.filter(id => id !== servicoId)
        : [...prev.servicosIds, servicoId]
    }));
  };

  return {
    planos,
    servicos,
    currentPlanos,
    planosStartIndex,
    planosEndIndex,
    totalPlanos,
    planosPerPage,
    setPlanosPerPage,
    planosPage,
    setPlanosPage,
    totalPlanosPages,
    handleEditPlano,
    showPlanoForm,
    setShowPlanoForm,
    editingPlano,
    planoFormData,
    handlePlanoSubmit,
    resetPlanoForm,
    handlePlanoInputChange,
    handleServicoToggle
  };
};

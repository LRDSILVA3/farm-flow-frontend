import { useState } from "react";
import { Fazenda, Talhao } from "../FazendasPage";

export const useFazendas = () => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([
    {
      id: "1",
      nome: "Fazenda São João",
      proprietario: "João Silva",
      area: "150.5",
      localizacao: "São Paulo - SP",
      contato: "(11) 99999-9999",
      status: "Ativo",
      talhoes: [
        { id: "1", nome: "Talhão A", area: "45.5", status: "Ativo", cidade: "São Paulo", estado: "SP", matricula: "MAT001" },
        { id: "2", nome: "Talhão B", area: "35.0", status: "Inativo", cidade: "São Paulo", estado: "SP", matricula: "MAT002" },
        { id: "3", nome: "Talhão C", area: "70.0", status: "Ativo", cidade: "São Paulo", estado: "SP", matricula: "MAT003" }
      ]
    },
    {
      id: "2",
      nome: "Fazenda Santa Maria",
      proprietario: "Maria Santos",
      area: "320.0",
      localizacao: "Minas Gerais - MG",
      contato: "(31) 88888-8888",
      status: "Ativo",
      talhoes: [
        { id: "4", nome: "Talhão Norte", area: "120.0", status: "Ativo", cidade: "Belo Horizonte", estado: "MG", matricula: "MAT004" },
        { id: "5", nome: "Talhão Sul", area: "200.0", status: "Ativo", cidade: "Belo Horizonte", estado: "MG", matricula: "MAT005" }
      ]
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFazendaForm, setShowFazendaForm] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<Fazenda | null>(null);
  const [showTalhoesModal, setShowTalhoesModal] = useState(false);
  const [selectedFazenda, setSelectedFazenda] = useState<Fazenda | null>(null);
  const [formData, setFormData] = useState<Fazenda>({
    id: "",
    nome: "",
    proprietario: "",
    area: "",
    localizacao: "",
    contato: "",
    status: "Ativo",
    talhoes: []
  });

  const [talhaoForm, setTalhaoForm] = useState<Talhao>({
    id: "",
    nome: "",
    area: "",
    status: "Ativo",
    cidade: "",
    estado: "",
    matricula: ""
  });

  return {
    fazendas,
    setFazendas,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    showFazendaForm,
    setShowFazendaForm,
    editingFazenda,
    setEditingFazenda,
    showTalhoesModal,
    setShowTalhoesModal,
    selectedFazenda,
    setSelectedFazenda,
    formData,
    setFormData,
    talhaoForm,
    setTalhaoForm
  };
};

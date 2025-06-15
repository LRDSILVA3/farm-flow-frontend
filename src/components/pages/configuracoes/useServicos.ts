
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Servico {
  id: string;
  nome: string;
  valorAlqueire: string;
  status: string;
  produtos: string;
}

export const useServicos = () => {
  const { toast } = useToast();
  
  const [servicos, setServicos] = useState<Servico[]>([
    { id: "1", nome: "Pulverização", valorAlqueire: "200.00", status: "Ativo", produtos: "Defensivo A, Defensivo B" },
    { id: "2", nome: "Plantio", valorAlqueire: "150.00", status: "Ativo", produtos: "Sementes, Fertilizante" }
  ]);

  const [servicosPage, setServicosPage] = useState(1);
  const [servicosPerPage, setServicosPerPage] = useState(10);
  const [showServicoForm, setShowServicoForm] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [servicoFormData, setServicoFormData] = useState<Servico>({
    id: "",
    nome: "",
    valorAlqueire: "",
    status: "Ativo",
    produtos: ""
  });

  const handleEditServico = (servico: Servico) => {
    console.log("Editando serviço:", servico);
    setEditingServico(servico);
    setServicoFormData(servico);
    setShowServicoForm(true);
  };

  const handleServicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingServico) {
      setServicos(prev => prev.map(s => s.id === editingServico.id ? servicoFormData : s));
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    } else {
      const newServico = { ...servicoFormData, id: Date.now().toString() };
      setServicos(prev => [...prev, newServico]);
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
    }
    
    resetServicoForm();
  };

  const resetServicoForm = () => {
    setServicoFormData({
      id: "",
      nome: "",
      valorAlqueire: "",
      status: "Ativo",
      produtos: ""
    });
    setEditingServico(null);
    setShowServicoForm(false);
  };

  const handleServicoInputChange = (field: keyof Servico, value: string) => {
    setServicoFormData(prev => ({ ...prev, [field]: value }));
  };

  // Pagination logic
  const totalServicos = servicos.length;
  const totalServicosPages = Math.ceil(totalServicos / servicosPerPage);
  const servicosStartIndex = (servicosPage - 1) * servicosPerPage;
  const servicosEndIndex = servicosStartIndex + servicosPerPage;
  const currentServicos = servicos.slice(servicosStartIndex, servicosEndIndex);

  return {
    servicos,
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
    totalServicos,
    totalServicosPages,
    servicosStartIndex,
    servicosEndIndex,
    currentServicos
  };
};

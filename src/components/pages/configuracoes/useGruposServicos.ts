
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface GrupoServico {
  id: string;
  nome: string;
  descricao: string;
  servicosIds: string[];
  status: string;
}

export const useGruposServicos = () => {
  const { toast } = useToast();
  
  const [gruposServicos, setGruposServicos] = useState<GrupoServico[]>([
    { 
      id: "1", 
      nome: "Pacote Completo", 
      descricao: "Pulverização + Plantio + Colheita", 
      servicosIds: ["1", "2", "3"], 
      status: "Ativo" 
    },
    { 
      id: "2", 
      nome: "Pacote Básico", 
      descricao: "Pulverização + Adubação", 
      servicosIds: ["1", "4"], 
      status: "Ativo" 
    }
  ]);

  const [gruposServicosPage, setGruposServicosPage] = useState(1);
  const [gruposServicosPerPage, setGruposServicosPerPage] = useState(10);
  const [showGrupoServicoForm, setShowGrupoServicoForm] = useState(false);
  const [editingGrupoServico, setEditingGrupoServico] = useState<GrupoServico | null>(null);
  const [grupoServicoFormData, setGrupoServicoFormData] = useState<GrupoServico>({
    id: "",
    nome: "",
    descricao: "",
    servicosIds: [],
    status: "Ativo"
  });

  const handleEditGrupoServico = (grupoServico: GrupoServico) => {
    console.log("Editando grupo de serviço:", grupoServico);
    setEditingGrupoServico(grupoServico);
    setGrupoServicoFormData(grupoServico);
    setShowGrupoServicoForm(true);
  };

  const handleGrupoServicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGrupoServico) {
      setGruposServicos(prev => prev.map(g => g.id === editingGrupoServico.id ? grupoServicoFormData : g));
      toast({
        title: "Grupo de serviço atualizado",
        description: "O grupo de serviço foi atualizado com sucesso.",
      });
    } else {
      const newGrupoServico = { ...grupoServicoFormData, id: Date.now().toString() };
      setGruposServicos(prev => [...prev, newGrupoServico]);
      toast({
        title: "Grupo de serviço criado",
        description: "O grupo de serviço foi criado com sucesso.",
      });
    }
    
    resetGrupoServicoForm();
  };

  const resetGrupoServicoForm = () => {
    setGrupoServicoFormData({
      id: "",
      nome: "",
      descricao: "",
      servicosIds: [],
      status: "Ativo"
    });
    setEditingGrupoServico(null);
    setShowGrupoServicoForm(false);
  };

  const handleGrupoServicoInputChange = (field: keyof GrupoServico, value: string | string[]) => {
    setGrupoServicoFormData(prev => ({ ...prev, [field]: value }));
  };

  // Pagination logic
  const totalGruposServicos = gruposServicos.length;
  const totalGruposServicosPages = Math.ceil(totalGruposServicos / gruposServicosPerPage);
  const gruposServicosStartIndex = (gruposServicosPage - 1) * gruposServicosPerPage;
  const gruposServicosEndIndex = gruposServicosStartIndex + gruposServicosPerPage;
  const currentGruposServicos = gruposServicos.slice(gruposServicosStartIndex, gruposServicosEndIndex);

  return {
    gruposServicos,
    gruposServicosPage,
    setGruposServicosPage,
    gruposServicosPerPage,
    setGruposServicosPerPage,
    showGrupoServicoForm,
    setShowGrupoServicoForm,
    editingGrupoServico,
    grupoServicoFormData,
    handleEditGrupoServico,
    handleGrupoServicoSubmit,
    resetGrupoServicoForm,
    handleGrupoServicoInputChange,
    totalGruposServicos,
    totalGruposServicosPages,
    gruposServicosStartIndex,
    gruposServicosEndIndex,
    currentGruposServicos
  };
};

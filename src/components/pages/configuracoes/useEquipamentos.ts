
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Equipamento {
  id: string;
  nome: string;
  status: string;
}

export const useEquipamentos = () => {
  const { toast } = useToast();
  
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([
    { id: "1", nome: "Caminhão 01", status: "Disponível" },
    { id: "2", nome: "Colheitadeira 01", status: "Em Manutenção" }
  ]);

  const [equipamentosPage, setEquipamentosPage] = useState(1);
  const [equipamentosPerPage, setEquipamentosPerPage] = useState(10);
  const [showEquipamentoForm, setShowEquipamentoForm] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);
  const [equipamentoFormData, setEquipamentoFormData] = useState<Equipamento>({
    id: "",
    nome: "",
    status: "Disponível"
  });

  const handleEditEquipamento = (equipamento: Equipamento) => {
    console.log("Editando equipamento:", equipamento);
    setEditingEquipamento(equipamento);
    setEquipamentoFormData(equipamento);
    setShowEquipamentoForm(true);
  };

  const handleEquipamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEquipamento) {
      setEquipamentos(prev => prev.map(e => e.id === editingEquipamento.id ? equipamentoFormData : e));
      toast({
        title: "Equipamento atualizado",
        description: "O equipamento foi atualizado com sucesso.",
      });
    } else {
      const newEquipamento = { ...equipamentoFormData, id: Date.now().toString() };
      setEquipamentos(prev => [...prev, newEquipamento]);
      toast({
        title: "Equipamento criado",
        description: "O equipamento foi criado com sucesso.",
      });
    }
    
    resetEquipamentoForm();
  };

  const resetEquipamentoForm = () => {
    setEquipamentoFormData({
      id: "",
      nome: "",
      status: "Disponível"
    });
    setEditingEquipamento(null);
    setShowEquipamentoForm(false);
  };

  const handleEquipamentoInputChange = (field: keyof Equipamento, value: string) => {
    setEquipamentoFormData(prev => ({ ...prev, [field]: value }));
  };

  // Pagination logic
  const totalEquipamentos = equipamentos.length;
  const totalEquipamentosPages = Math.ceil(totalEquipamentos / equipamentosPerPage);
  const equipamentosStartIndex = (equipamentosPage - 1) * equipamentosPerPage;
  const equipamentosEndIndex = equipamentosStartIndex + equipamentosPerPage;
  const currentEquipamentos = equipamentos.slice(equipamentosStartIndex, equipamentosEndIndex);

  return {
    equipamentos,
    equipamentosPage,
    setEquipamentosPage,
    equipamentosPerPage,
    setEquipamentosPerPage,
    showEquipamentoForm,
    setShowEquipamentoForm,
    editingEquipamento,
    equipamentoFormData,
    handleEditEquipamento,
    handleEquipamentoSubmit,
    resetEquipamentoForm,
    handleEquipamentoInputChange,
    totalEquipamentos,
    totalEquipamentosPages,
    equipamentosStartIndex,
    equipamentosEndIndex,
    currentEquipamentos
  };
};

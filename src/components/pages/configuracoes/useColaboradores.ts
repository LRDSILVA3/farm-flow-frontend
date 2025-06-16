
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Colaborador {
  id: string;
  nome: string;
  endereco: string;
  status: "Ativo" | "Inativo";
}

export const useColaboradores = () => {
  const { toast } = useToast();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([
    {
      id: "1",
      nome: "João Silva",
      endereco: "Rua das Flores, 123 - São Paulo/SP",
      status: "Ativo"
    },
    {
      id: "2", 
      nome: "Maria Santos",
      endereco: "Av. Principal, 456 - Campinas/SP",
      status: "Ativo"
    }
  ]);

  const [showColaboradorForm, setShowColaboradorForm] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [colaboradorFormData, setColaboradorFormData] = useState<Colaborador>({
    id: "",
    nome: "",
    endereco: "",
    status: "Ativo"
  });

  const handleColaboradorSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (editingColaborador) {
      setColaboradores(prev => prev.map(c => c.id === editingColaborador.id ? colaboradorFormData : c));
      toast({
        title: "Colaborador atualizado",
        description: "O colaborador foi atualizado com sucesso.",
      });
    } else {
      const newColaborador = { ...colaboradorFormData, id: Date.now().toString() };
      setColaboradores(prev => [...prev, newColaborador]);
      toast({
        title: "Colaborador criado",
        description: "O colaborador foi criado com sucesso.",
      });
    }
    
    resetColaboradorForm();
  };

  const resetColaboradorForm = () => {
    setColaboradorFormData({
      id: "",
      nome: "",
      endereco: "",
      status: "Ativo"
    });
    setEditingColaborador(null);
    setShowColaboradorForm(false);
  };

  const handleColaboradorInputChange = (field: keyof Colaborador, value: string) => {
    setColaboradorFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    colaboradores,
    showColaboradorForm,
    setShowColaboradorForm,
    editingColaborador,
    setEditingColaborador,
    colaboradorFormData,
    setColaboradorFormData,
    handleColaboradorSubmit,
    resetColaboradorForm,
    handleColaboradorInputChange
  };
};

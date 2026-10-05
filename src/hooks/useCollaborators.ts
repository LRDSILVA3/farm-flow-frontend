import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
}

export const useCollaborators = () => {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [collaboratorsPage, setCollaboratorsPage] = useState(1);
  const [collaboratorsPerPage, setCollaboratorsPerPage] = useState(10);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [collaboratorFormData, setCollaboratorFormData] = useState<Collaborator>({
    id: "",
    name: "",
    role: "Operador de Campo",
    phone: "",
    email: "",
    status: "Ativo"
  });

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/collaborators');
      if (Array.isArray(data)) {
        setCollaborators(data.map(c => ({
          id: c.id,
          name: c.name || "",
          role: c.role || "Operador",
          phone: c.phone || "",
          email: c.email || "",
          status: c.status || "Ativo"
        })));
      }
    } catch (error: any) {
      toast({ title: "Erro ao carregar colaboradores", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const handleCollaboratorInputChange = (field: keyof Collaborator, value: any) => {
    setCollaboratorFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCollaboratorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: collaboratorFormData.name,
        role: collaboratorFormData.role,
        phone: collaboratorFormData.phone,
        email: collaboratorFormData.email,
        status: collaboratorFormData.status
      };

      if (editingCollaborator) {
        await api.put(`/collaborators/${editingCollaborator.id}`, payload);
        toast({ title: "Colaborador atualizado", description: "Dados atualizados com sucesso." });
      } else {
        await api.post('/collaborators', payload);
        toast({ title: "Colaborador adicionado", description: "Colaborador cadastrado com sucesso." });
      }
      resetCollaboratorForm();
      await fetchCollaborators();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleEditCollaborator = (item: Collaborator) => {
    setEditingCollaborator(item);
    setCollaboratorFormData(item);
    setShowCollaboratorForm(true);
  };

  const handleDeleteCollaborator = async (id: string) => {
    try {
      await api.delete(`/collaborators/${id}`);
      toast({ title: "Colaborador removido", description: "Excluído com sucesso." });
      await fetchCollaborators();
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const resetCollaboratorForm = () => {
    setShowCollaboratorForm(false);
    setEditingCollaborator(null);
    setCollaboratorFormData({ id: "", name: "", role: "Operador de Campo", phone: "", email: "", status: "Ativo" });
  };

  const totalCollaborators = collaborators.length;
  const totalCollaboratorsPages = Math.max(1, Math.ceil(totalCollaborators / (collaboratorsPerPage || 10)));
  const safePage = Math.min(collaboratorsPage, totalCollaboratorsPages);
  const collaboratorsStartIndex = (safePage - 1) * (collaboratorsPerPage || 10);
  const collaboratorsEndIndex = collaboratorsStartIndex + (collaboratorsPerPage || 10);
  const paginatedCollaborators = collaborators.slice(collaboratorsStartIndex, collaboratorsEndIndex);

  return {
    collaborators: paginatedCollaborators,
    allCollaborators: collaborators,
    loading,
    collaboratorsPage: safePage,
    setCollaboratorsPage,
    collaboratorPage: safePage,
    setCollaboratorPage: setCollaboratorsPage,
    collaboratorsPerPage,
    setCollaboratorsPerPage,
    collaboratorPerPage: collaboratorsPerPage,
    setCollaboratorPerPage: setCollaboratorsPerPage,
    totalCollaborators,
    totalCollaboratorsPages,
    collaboratorsStartIndex,
    collaboratorsEndIndex,
    showCollaboratorForm,
    setShowCollaboratorForm,
    editingCollaborator,
    setEditingCollaborator,
    collaboratorFormData,
    setCollaboratorFormData,
    handleCollaboratorInputChange,
    handleInputChange: handleCollaboratorInputChange,
    handleCollaboratorSubmit,
    handleSaveCollaborator: handleCollaboratorSubmit,
    handleEditCollaborator,
    handleDeleteCollaborator,
    resetCollaboratorForm,
    refetch: fetchCollaborators
  };
};

import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Collaborator {
  id: string;
  name: string;
  address: string;
  status: "Ativo" | "Inativo";
}

export const useCollaborators = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [collaboratorsPage, setCollaboratorsPage] = useState(1);
  const [collaboratorsPerPage, setCollaboratorsPerPage] = useState(10);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [collaboratorFormData, setCollaboratorFormData] = useState<Collaborator>({
    id: "",
    name: "",
    address: "",
    status: "Ativo"
  });

  const fetchCollaborators = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("collaborators")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar colaboradores", description: error.message, variant: "destructive" });
    } else {
      setCollaborators(data?.map(c => ({
        id: c.id,
        name: c.name,
        address: c.address || "",
        status: (c.status as "Ativo" | "Inativo") || "Ativo"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollaborators();
  }, [user]);

  const handleCollaboratorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingCollaborator) {
      const { error } = await supabase
        .from("collaborators")
        .update({
          name: collaboratorFormData.name,
          address: collaboratorFormData.address,
          status: collaboratorFormData.status
        })
        .eq("id", editingCollaborator.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Colaborador atualizado", description: "O colaborador foi atualizado com sucesso." });
        fetchCollaborators();
      }
    } else {
      const { error } = await supabase
        .from("collaborators")
        .insert({
          user_id: user.id,
          name: collaboratorFormData.name,
          address: collaboratorFormData.address,
          status: collaboratorFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Colaborador criado", description: "O colaborador foi criado com sucesso." });
        fetchCollaborators();
      }
    }

    resetCollaboratorForm();
  };

  const resetCollaboratorForm = () => {
    setCollaboratorFormData({
      id: "",
      name: "",
      address: "",
      status: "Ativo"
    });
    setEditingCollaborator(null);
    setShowCollaboratorForm(false);
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("collaborators")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Colaborador excluído", description: "O colaborador foi excluído com sucesso." });
      fetchCollaborators();
    }
  };

  const handleCollaboratorInputChange = (field: keyof Collaborator, value: string) => {
    setCollaboratorFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalCollaborators = collaborators.length;
  const totalCollaboratorsPages = Math.ceil(totalCollaborators / collaboratorsPerPage);
  const collaboratorsStartIndex = (collaboratorsPage - 1) * collaboratorsPerPage;
  const collaboratorsEndIndex = collaboratorsStartIndex + collaboratorsPerPage;
  const currentCollaborators = collaborators.slice(collaboratorsStartIndex, collaboratorsEndIndex);

  return {
    collaborators,
    loading,
    collaboratorsPage,
    setCollaboratorsPage,
    collaboratorsPerPage,
    setCollaboratorsPerPage,
    showCollaboratorForm,
    setShowCollaboratorForm,
    editingCollaborator,
    setEditingCollaborator,
    collaboratorFormData,
    setCollaboratorFormData,
    handleCollaboratorSubmit,
    resetCollaboratorForm,
    handleCollaboratorInputChange,
    handleDeleteCollaborator,
    totalCollaborators,
    totalCollaboratorsPages,
    collaboratorsStartIndex,
    collaboratorsEndIndex,
    currentCollaborators,
    fetchCollaborators
  };
};

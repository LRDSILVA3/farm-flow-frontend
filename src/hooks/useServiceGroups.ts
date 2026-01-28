import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  servicesIds: string[];
  status: string;
}

export const useServiceGroups = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceGroupsPage, setServiceGroupsPage] = useState(1);
  const [serviceGroupsPerPage, setServiceGroupsPerPage] = useState(10);
  const [showServiceGroupForm, setShowServiceGroupForm] = useState(false);
  const [editingServiceGroup, setEditingServiceGroup] = useState<ServiceGroup | null>(null);
  const [serviceGroupFormData, setServiceGroupFormData] = useState<ServiceGroup>({
    id: "",
    name: "",
    description: "",
    servicesIds: [],
    status: "Ativo"
  });

  const fetchServiceGroups = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("service_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar grupos de serviços", description: error.message, variant: "destructive" });
    } else {
      setServiceGroups(data?.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || "",
        servicesIds: g.services_ids || [],
        status: g.status || "Ativo"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServiceGroups();
  }, [user]);

  const handleEditServiceGroup = (group: ServiceGroup) => {
    setEditingServiceGroup(group);
    setServiceGroupFormData(group);
    setShowServiceGroupForm(true);
  };

  const handleServiceGroupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingServiceGroup) {
      const { error } = await supabase
        .from("service_groups")
        .update({
          name: serviceGroupFormData.name,
          description: serviceGroupFormData.description,
          services_ids: serviceGroupFormData.servicesIds,
          status: serviceGroupFormData.status
        })
        .eq("id", editingServiceGroup.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Grupo atualizado", description: "O grupo de serviços foi atualizado com sucesso." });
        fetchServiceGroups();
      }
    } else {
      const { error } = await supabase
        .from("service_groups")
        .insert({
          user_id: user.id,
          name: serviceGroupFormData.name,
          description: serviceGroupFormData.description,
          services_ids: serviceGroupFormData.servicesIds,
          status: serviceGroupFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Grupo criado", description: "O grupo de serviços foi criado com sucesso." });
        fetchServiceGroups();
      }
    }

    resetServiceGroupForm();
  };

  const resetServiceGroupForm = () => {
    setServiceGroupFormData({
      id: "",
      name: "",
      description: "",
      servicesIds: [],
      status: "Ativo"
    });
    setEditingServiceGroup(null);
    setShowServiceGroupForm(false);
  };

  const handleDeleteServiceGroup = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("service_groups")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Grupo excluído", description: "O grupo de serviços foi excluído com sucesso." });
      fetchServiceGroups();
    }
  };

  const handleServiceGroupInputChange = (field: keyof ServiceGroup, value: string | string[]) => {
    setServiceGroupFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalServiceGroups = serviceGroups.length;
  const totalServiceGroupsPages = Math.ceil(totalServiceGroups / serviceGroupsPerPage);
  const serviceGroupsStartIndex = (serviceGroupsPage - 1) * serviceGroupsPerPage;
  const serviceGroupsEndIndex = serviceGroupsStartIndex + serviceGroupsPerPage;
  const currentServiceGroups = serviceGroups.slice(serviceGroupsStartIndex, serviceGroupsEndIndex);

  return {
    serviceGroups,
    loading,
    serviceGroupsPage,
    setServiceGroupsPage,
    serviceGroupsPerPage,
    setServiceGroupsPerPage,
    showServiceGroupForm,
    setShowServiceGroupForm,
    editingServiceGroup,
    serviceGroupFormData,
    handleEditServiceGroup,
    handleServiceGroupSubmit,
    resetServiceGroupForm,
    handleServiceGroupInputChange,
    handleDeleteServiceGroup,
    totalServiceGroups,
    totalServiceGroupsPages,
    serviceGroupsStartIndex,
    serviceGroupsEndIndex,
    currentServiceGroups,
    fetchServiceGroups
  };
};

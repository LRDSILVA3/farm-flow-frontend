import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  servicesIds: string[];
  status: string;
}

export const useServiceGroups = () => {
  const { toast } = useToast();

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
    setLoading(true);
    try {
      const data = await api.get<any[]>('/service-groups');
      if (Array.isArray(data)) {
        setServiceGroups(data.map(g => ({
          id: g.id,
          name: g.name,
          description: g.description || "",
          servicesIds: g.services_ids || g.servicesIds || [],
          status: g.status || "Ativo"
        })));
      }
    } catch (err: any) {
      toast({ title: "Erro ao carregar grupos", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceGroups();
  }, []);

  const handleEditServiceGroup = (group: ServiceGroup) => {
    setEditingServiceGroup(group);
    setServiceGroupFormData(group);
    setShowServiceGroupForm(true);
  };

  const handleServiceGroupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: serviceGroupFormData.name,
        description: serviceGroupFormData.description,
        services_ids: serviceGroupFormData.servicesIds,
        status: serviceGroupFormData.status
      };

      if (editingServiceGroup) {
        await api.put(`/service-groups/${editingServiceGroup.id}`, payload);
        toast({ title: "Grupo atualizado", description: "O grupo de serviços foi atualizado com sucesso." });
      } else {
        await api.post('/service-groups', payload);
        toast({ title: "Grupo criado", description: "O grupo de serviços foi criado com sucesso." });
      }
      fetchServiceGroups();
      resetServiceGroupForm();
    } catch (err: any) {
      toast({ title: "Erro ao salvar grupo", description: err.message, variant: "destructive" });
    }
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
    try {
      await api.delete(`/service-groups/${id}`);
      toast({ title: "Grupo excluído", description: "O grupo de serviços foi excluído com sucesso." });
      fetchServiceGroups();
    } catch (err: any) {
      toast({ title: "Erro ao excluir grupo", description: err.message, variant: "destructive" });
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

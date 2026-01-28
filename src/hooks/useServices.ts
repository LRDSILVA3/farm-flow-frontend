import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Service {
  id: string;
  name: string;
  valuePerAlqueire: string;
  status: string;
  products: string;
  isFixed: boolean;
}

export const useServices = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesPerPage, setServicesPerPage] = useState(10);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Service>({
    id: "",
    name: "",
    valuePerAlqueire: "",
    status: "Ativo",
    products: "",
    isFixed: false
  });

  const fetchServices = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar serviços", description: error.message, variant: "destructive" });
    } else {
      setServices(data?.map(s => ({
        id: s.id,
        name: s.name,
        valuePerAlqueire: s.value_per_alqueire || "",
        status: s.status || "Ativo",
        products: s.products || "",
        isFixed: s.is_fixed || false
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData(service);
    setShowServiceForm(true);
  };

  const handleServiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingService) {
      const { error } = await supabase
        .from("services")
        .update({
          name: serviceFormData.name,
          value_per_alqueire: serviceFormData.valuePerAlqueire,
          status: serviceFormData.status,
          products: serviceFormData.products
        })
        .eq("id", editingService.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Serviço atualizado", description: "O serviço foi atualizado com sucesso." });
        fetchServices();
      }
    } else {
      const { error } = await supabase
        .from("services")
        .insert({
          user_id: user.id,
          name: serviceFormData.name,
          value_per_alqueire: serviceFormData.valuePerAlqueire,
          status: serviceFormData.status,
          products: serviceFormData.products
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Serviço criado", description: "O serviço foi criado com sucesso." });
        fetchServices();
      }
    }

    resetServiceForm();
  };

  const resetServiceForm = () => {
    setServiceFormData({
      id: "",
      name: "",
      valuePerAlqueire: "",
      status: "Ativo",
      products: "",
      isFixed: false
    });
    setEditingService(null);
    setShowServiceForm(false);
  };

  const handleDeleteService = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Serviço excluído", description: "O serviço foi excluído com sucesso." });
      fetchServices();
    }
  };

  const handleServiceInputChange = (field: keyof Service, value: string) => {
    setServiceFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalServices = services.length;
  const totalServicesPages = Math.ceil(totalServices / servicesPerPage);
  const servicesStartIndex = (servicesPage - 1) * servicesPerPage;
  const servicesEndIndex = servicesStartIndex + servicesPerPage;
  const currentServices = services.slice(servicesStartIndex, servicesEndIndex);

  return {
    services,
    loading,
    servicesPage,
    setServicesPage,
    servicesPerPage,
    setServicesPerPage,
    showServiceForm,
    setShowServiceForm,
    editingService,
    serviceFormData,
    handleEditService,
    handleServiceSubmit,
    resetServiceForm,
    handleServiceInputChange,
    handleDeleteService,
    totalServices,
    totalServicesPages,
    servicesStartIndex,
    servicesEndIndex,
    currentServices,
    fetchServices
  };
};

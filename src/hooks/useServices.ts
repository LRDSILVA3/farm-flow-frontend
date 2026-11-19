import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface ServiceProductLink {
  id: string;
  service_id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    category?: string;
    unit?: string;
    price?: number;
    quantity?: number;
  };
}

export interface Service {
  id: string;
  name: string;
  valuePerAlqueire: string;
  status: string;
  products: string;
  isFixed: boolean;
  service_products?: ServiceProductLink[];
  product_ids?: string[];
}

export const useServices = () => {
  const { toast } = useToast();
  
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
    isFixed: false,
    product_ids: [],
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/services');
      if (Array.isArray(data)) {
        setServices(data.map(s => {
          const links = Array.isArray(s.service_products) ? s.service_products : [];
          return {
            id: s.id,
            name: s.name,
            valuePerAlqueire: s.value_per_alqueire || s.valuePerAlqueire || "",
            status: s.status || "Ativo",
            products: s.products || "",
            isFixed: s.is_fixed || s.isFixed || false,
            service_products: links,
            product_ids: links.map((l: any) => l.product_id),
          };
        }));
      }
    } catch (err: any) {
      toast({ title: "Erro ao carregar serviços", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditService = (service: Service) => {
    setEditingService(service);
    const productIds = service.service_products?.map(sp => sp.product_id) || service.product_ids || [];
    setServiceFormData({
      ...service,
      product_ids: productIds,
    });
    setShowServiceForm(true);
  };

  const handleServiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: serviceFormData.name,
        value_per_alqueire: serviceFormData.valuePerAlqueire,
        status: serviceFormData.status,
        products: serviceFormData.products,
        is_fixed: serviceFormData.isFixed,
        product_ids: serviceFormData.product_ids || [],
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, payload);
        toast({ title: "Serviço atualizado", description: "O serviço foi atualizado com sucesso." });
      } else {
        await api.post('/services', payload);
        toast({ title: "Serviço criado", description: "O serviço foi criado com sucesso." });
      }
      fetchServices();
      resetServiceForm();
    } catch (err: any) {
      toast({ title: "Erro ao salvar serviço", description: err.message, variant: "destructive" });
    }
  };

  const resetServiceForm = () => {
    setServiceFormData({
      id: "",
      name: "",
      valuePerAlqueire: "",
      status: "Ativo",
      products: "",
      isFixed: false,
      product_ids: [],
    });
    setEditingService(null);
    setShowServiceForm(false);
  };

  const syncServiceProducts = async (serviceId: string, productIds: string[]) => {
    try {
      await api.put(`/services/${serviceId}/products`, { product_ids: productIds });
      toast({ title: "Produtos vinculados", description: "Vínculos de produtos atualizados com sucesso." });
      fetchServices();
      return true;
    } catch (err: any) {
      toast({ title: "Erro ao vincular produtos", description: err.message, variant: "destructive" });
      return false;
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await api.delete(`/services/${id}`);
      toast({ title: "Serviço excluído", description: "O serviço foi excluído com sucesso." });
      fetchServices();
    } catch (err: any) {
      toast({ title: "Erro ao excluir serviço", description: err.message, variant: "destructive" });
    }
  };

  const handleServiceInputChange = (field: keyof Service, value: any) => {
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
    syncServiceProducts,
    totalServices,
    totalServicesPages,
    servicesStartIndex,
    servicesEndIndex,
    currentServices,
    fetchServices,
  };
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Order {
  id: string;
  clientId: string;
  farmId: string;
  type: string;
  serviceName: string;
  productsData: any[];
  serviceGroup: string;
  area: string;
  value: string;
  status: string;
  payment: string;
}

interface OrderDB {
  id: string;
  user_id: string;
  client_id: string | null;
  farm_id: string | null;
  type: string;
  service_name: string | null;
  products_data: any;
  service_group: string | null;
  area: number | null;
  value: number | null;
  status: string | null;
  payment: string | null;
  created_at: string;
  updated_at: string;
}

const mapFromDB = (db: OrderDB): Order => ({
  id: db.id,
  clientId: db.client_id || "",
  farmId: db.farm_id || "",
  type: db.type || "Serviço",
  serviceName: db.service_name || "",
  productsData: Array.isArray(db.products_data) ? db.products_data : [],
  serviceGroup: db.service_group || "",
  area: db.area?.toString() || "",
  value: db.value ? `R$ ${db.value.toFixed(2).replace('.', ',')}` : "",
  status: db.status || "Pendente",
  payment: db.payment || "Aguardando"
});

const parseValue = (value: string): number | null => {
  if (!value) return null;
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<Order>({
    id: "",
    clientId: "",
    farmId: "",
    type: "Serviço",
    serviceName: "",
    productsData: [],
    serviceGroup: "",
    area: "",
    value: "",
    status: "Pendente",
    payment: "Aguardando"
  });

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(mapFromDB));
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pedidos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          client_id: order.clientId || null,
          farm_id: order.farmId || null,
          type: order.type || "Serviço",
          service_name: order.serviceName || null,
          products_data: order.productsData || [],
          service_group: order.serviceGroup || null,
          area: order.area ? parseFloat(order.area) : null,
          value: parseValue(order.value),
          status: order.status || "Pendente",
          payment: order.payment || "Aguardando"
        })
        .select()
        .single();

      if (error) throw error;
      setOrders(prev => [mapFromDB(data), ...prev]);
      toast({
        title: "Pedido criado",
        description: "O pedido foi criado com sucesso."
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateOrder = async (order: Order) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          client_id: order.clientId || null,
          farm_id: order.farmId || null,
          type: order.type || "Serviço",
          service_name: order.serviceName || null,
          products_data: order.productsData || [],
          service_group: order.serviceGroup || null,
          area: order.area ? parseFloat(order.area) : null,
          value: parseValue(order.value),
          status: order.status || "Pendente",
          payment: order.payment || "Aguardando"
        })
        .eq("id", order.id);

      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
      toast({
        title: "Pedido atualizado",
        description: "O pedido foi atualizado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pedido",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    orders,
    setOrders,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    showOrderForm,
    setShowOrderForm,
    editingOrder,
    setEditingOrder,
    formData,
    setFormData,
    addOrder,
    updateOrder,
    refetch: fetchOrders
  };
};

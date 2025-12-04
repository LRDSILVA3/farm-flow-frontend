import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pedido } from "../PedidosPage";

interface PedidoDB {
  id: string;
  user_id: string;
  cliente_id: string | null;
  fazenda_id: string | null;
  tipo: string;
  servico: string | null;
  produtos: any;
  grupo_servico: string | null;
  area: number | null;
  valor: number | null;
  status: string | null;
  pagamento: string | null;
  created_at: string;
  updated_at: string;
}

const mapFromDB = (db: PedidoDB): Pedido => ({
  id: db.id,
  cliente: db.cliente_id || "",
  fazenda: db.fazenda_id || "",
  tipo: db.tipo || "Serviço",
  servico: db.servico || "",
  produtos: Array.isArray(db.produtos) ? db.produtos : [],
  grupoServico: db.grupo_servico || "",
  area: db.area?.toString() || "",
  valor: db.valor ? `R$ ${db.valor.toFixed(2).replace('.', ',')}` : "",
  status: db.status || "Pendente",
  pagamento: db.pagamento || "Aguardando"
});

const parseValor = (valor: string): number | null => {
  if (!valor) return null;
  const cleaned = valor.replace(/[R$\s.]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [formData, setFormData] = useState<Pedido>({
    id: "",
    cliente: "",
    fazenda: "",
    tipo: "Serviço",
    servico: "",
    produtos: [],
    grupoServico: "",
    area: "",
    valor: "",
    status: "Pendente",
    pagamento: "Aguardando"
  });

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPedidos((data || []).map(mapFromDB));
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
    fetchPedidos();
  }, []);

  const addPedido = async (pedido: Omit<Pedido, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pedidos")
        .insert({
          user_id: user.id,
          cliente_id: pedido.cliente || null,
          fazenda_id: pedido.fazenda || null,
          tipo: pedido.tipo || "Serviço",
          servico: pedido.servico || null,
          produtos: pedido.produtos || [],
          grupo_servico: pedido.grupoServico || null,
          area: pedido.area ? parseFloat(pedido.area) : null,
          valor: parseValor(pedido.valor),
          status: pedido.status || "Pendente",
          pagamento: pedido.pagamento || "Aguardando"
        })
        .select()
        .single();

      if (error) throw error;
      setPedidos(prev => [mapFromDB(data), ...prev]);
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

  const updatePedido = async (pedido: Pedido) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({
          cliente_id: pedido.cliente || null,
          fazenda_id: pedido.fazenda || null,
          tipo: pedido.tipo || "Serviço",
          servico: pedido.servico || null,
          produtos: pedido.produtos || [],
          grupo_servico: pedido.grupoServico || null,
          area: pedido.area ? parseFloat(pedido.area) : null,
          valor: parseValor(pedido.valor),
          status: pedido.status || "Pendente",
          pagamento: pedido.pagamento || "Aguardando"
        })
        .eq("id", pedido.id);

      if (error) throw error;
      setPedidos(prev => prev.map(p => p.id === pedido.id ? pedido : p));
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
    pedidos,
    setPedidos,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    showPedidoForm,
    setShowPedidoForm,
    editingPedido,
    setEditingPedido,
    formData,
    setFormData,
    addPedido,
    updatePedido,
    refetch: fetchPedidos
  };
};

import { useState } from "react";
import { Pedido } from "../PedidosPage";

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: "1",
      cliente: "João Silva",
      fazenda: "Fazenda São João",
      tipo: "Serviço",
      servico: "Pulverização",
      produtos: [],
      grupoServico: "",
      area: "45.5",
      valor: "R$ 9.100,00",
      status: "Pendente",
      pagamento: "Aguardando"
    }
  ]);

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

  return {
    pedidos,
    setPedidos,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    showPedidoForm,
    setShowPedidoForm,
    editingPedido,
    setEditingPedido,
    formData,
    setFormData
  };
};

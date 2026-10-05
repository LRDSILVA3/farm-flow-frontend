
const sanitizeText = (str: string | null | undefined): string => {
  if (!str) return '';
  let s = String(str);
  s = s.replace(/\uFFFD/g, 'ê');
  s = s.replace(/Confer[?\uFFFD]?ncia/gi, 'Conferência');
  s = s.replace(/ConferÃªncia/gi, 'Conferência');
  s = s.replace(/Conferncia/gi, 'Conferência');
  s = s.replace(/Compacta[?\uFFFD]?o|CompactaÃ§Ã£o|Compactao/gi, 'Compactação');
  s = s.replace(/Aplica[?\uFFFD]?o|AplicaÃ§Ã£o|Aplicao/gi, 'Aplicação');
  s = s.replace(/Pulveriza[?\uFFFD]?o|PulverizaÃ§Ã£o|Pulverizao/gi, 'Pulverização');
  s = s.replace(/Equaliza[?\uFFFD]?o|EqualizaÃ§Ã£o|Equalizao/gi, 'Equalização');
  return s;
};
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface OrderExecution {
  id: string;
  date: string;
  areaExecuted: number;
  percentage: number;
  notes?: string;
  collaboratorName?: string;
  createdAt: string;
}

export interface OrderSchedule {
  id: string;
  scheduledDate: string;
  description: string;
  status: 'Agendado' | 'Realizado' | 'Cancelado';
  createdAt: string;
}

export interface OrderActionLog {
  id: string;
  action: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface OrderPayment {
  id: string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  client?: { id: string; name: string };
  farmId: string;
  farm?: { id: string; name: string };
  type: string;
  serviceName: string;
  productsData: any[];
  serviceGroup: string;
  area: string;
  value: string;
  numericValue: number;
  status: string; // 'Pendente' | 'Aprovado' | 'Em Andamento' | 'Concluído' | 'Cancelado'
  payment: string; // 'Aguardando' | 'Parcial' | 'Pago' | 'Cancelado'
  executions: OrderExecution[];
  schedules: OrderSchedule[];
  payments: OrderPayment[];
  logs: OrderActionLog[];
  executedArea: number;
  paidAmount: number;
  createdAt?: string;
}

interface OrderDB {
  id: string;
  user_id: string;
  client_id: string | null;
  farm_id: string | null;
  client?: { id: string; name: string };
  farm?: { id: string; name: string };
  type: string;
  service_name: string | null;
  products_data: any;
  service_group: string | null;
  area: number | string | null;
  value: number | string | null;
  status: string | null;
  payment: string | null;
  executions?: any[];
  schedules?: any[];
  payments?: any[];
  logs?: any[];
  executed_area?: number | string | null;
  paid_amount?: number | string | null;
  created_at: string;
  updated_at: string;
}

export const parseValue = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  
  const str = String(value).trim();
  // Se contiver vírgula (formato brasileiro R$ 19.320,34 ou 19320,34)
  if (str.includes(',')) {
    const cleaned = str.replace(/[R$\s.]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  
  // Formato padrão decimal (19320.34 ou 19320)
  const cleaned = str.replace(/[R$\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const formatCurrencyBRL = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const mapStatusToPT = (status: string | null): string => {
  switch (status) {
    case 'Pending':
    case 'pending':
      return 'Pendente';
    case 'Approved':
    case 'approved':
      return 'Aprovado';
    case 'In Progress':
    case 'in_progress':
    case 'Em Execução':
      return 'Em Andamento';
    case 'Completed':
    case 'completed':
      return 'Concluído';
    case 'Cancelled':
    case 'cancelled':
    case 'Canceled':
      return 'Cancelado';
    default:
      return status || 'Pendente';
  }
};

const mapPaymentToPT = (payment: string | null): string => {
  switch (payment) {
    case 'Awaiting':
    case 'awaiting':
    case 'Pending':
      return 'Aguardando';
    case 'Partial':
    case 'partial':
      return 'Parcial';
    case 'Paid':
    case 'paid':
      return 'Pago';
    default:
      return payment || 'Aguardando';
  }
};

const mapFromDB = (db: OrderDB): Order => {
  const numValue = typeof db.value === 'number' ? db.value : (parseFloat(db.value as string) || 0);
  const numArea = typeof db.area === 'number' ? db.area : (parseFloat(db.area as string) || 0);
  const numExecuted = typeof db.executed_area === 'number' ? db.executed_area : (parseFloat(db.executed_area as string) || 0);
  const numPaid = typeof db.paid_amount === 'number' ? db.paid_amount : (parseFloat(db.paid_amount as string) || 0);

  // Ação financeira: Dar Baixa Direta
  const markOrderAsPaid = async (orderId: string, paymentDetails: { amount?: number; method: string; notes?: string }) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      const orderTotal = order.numericValue || parseValue(order.value) || 0;
      const payAmount = paymentDetails.amount !== undefined ? paymentDetails.amount : orderTotal;
      const newPaidAmount = (order.paidAmount || 0) + payAmount;
      const isTotal = newPaidAmount >= orderTotal && orderTotal > 0;
      const newPaymentStatus = isTotal ? "Pago" : "Parcial";

      const newPayment: OrderPayment = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        amount: payAmount,
        method: paymentDetails.method || "PIX",
        notes: paymentDetails.notes,
        createdAt: new Date().toISOString()
      };

      const updatedPayments = [...(order.payments || []), newPayment];
      const baixaLog = createLogEntry("Baixa Financeira", `Baixa financeira de ${formatCurrencyBRL(payAmount)} via ${paymentDetails.method || 'PIX'}. Status do pagamento: ${newPaymentStatus}`);
      const updatedLogs = [...(order.logs || []), baixaLog];

      await updateOrder({
        ...order,
        payments: updatedPayments,
        paidAmount: newPaidAmount,
        payment: newPaymentStatus,
        logs: updatedLogs
      });

      toast({
        title: "Baixa financeira realizada",
        description: `Pagamento de ${formatCurrencyBRL(payAmount)} registrado com sucesso.`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao dar baixa",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return {
    id: db.id,
    clientId: db.client_id || (db.client?.id) || "",
    client: db.client ? { id: db.client.id, name: db.client.name } : undefined,
    farmId: db.farm_id || (db.farm?.id) || "",
    farm: db.farm ? { id: db.farm.id, name: db.farm.name } : undefined,
    type: sanitizeText(db.type || "Serviço"),
    serviceName: sanitizeText(db.service_name || db.type || "Serviço"),
    productsData: Array.isArray(db.products_data) ? db.products_data : [],
    serviceGroup: db.service_group || "",
    area: numArea > 0 ? numArea.toString() : (db.area ? String(db.area) : ""),
    value: numValue > 0 ? formatCurrencyBRL(numValue) : (db.value ? String(db.value) : ""),
    numericValue: numValue,
    status: mapStatusToPT(db.status),
    payment: mapPaymentToPT(db.payment),
    executions: Array.isArray(db.executions) ? db.executions : [],
    schedules: Array.isArray(db.schedules) ? db.schedules : [],
    payments: Array.isArray(db.payments) ? db.payments : [],
    logs: Array.isArray(db.logs) ? db.logs : [],
    executedArea: numExecuted,
    paidAmount: numPaid,
    createdAt: db.created_at,
  };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const initialOrderFormData: Order = {
    id: "",
    clientId: "",
    farmId: "",
    type: "Amostragem de Solo (AP)",
    serviceName: "Amostragem de Solo (AP)",
    productsData: [],
    serviceGroup: "",
    area: "",
    value: "",
    numericValue: 0,
    status: "Pendente",
    payment: "Aguardando",
    executions: [],
    schedules: [],
    payments: [],
    logs: [],
    executedArea: 0,
    paidAmount: 0
  };

  const [formData, setFormData] = useState<Order>({ ...initialOrderFormData });

  const resetOrderForm = () => {
    setEditingOrder(null);
    setFormData({ ...initialOrderFormData });
  };

  const fetchOrders = async () => {
    try {
      const backendOrders = await api.get<any[]>('/orders');
      if (Array.isArray(backendOrders)) {
        setOrders(backendOrders.map(mapFromDB));
      }
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

  const createLogEntry = (action: string, details?: string): OrderActionLog => {
    let userName = "Administrador FarmFlow";
    try {
      const raw = localStorage.getItem("@FarmFlow:user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) userName = parsed.name;
      }
    } catch {}
    return {
      id: crypto.randomUUID(),
      action,
      userName,
      timestamp: new Date().toISOString(),
      details,
    };
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const numVal = parseValue(order.value);
      const numArea = order.area ? parseFloat(order.area) : null;
      const sName = order.serviceName || order.type || "Serviço";

      const initLog = createLogEntry("Criação", `Pedido criado no valor de ${formatCurrencyBRL(numVal || 0)} para o serviço ${sName}`);
      const initialLogs = order.logs && order.logs.length > 0 ? order.logs : [initLog];

      try {
        const created = await api.post<any>('/orders', {
          client_id: order.clientId || null,
          farm_id: order.farmId || null,
          type: order.type || "Serviço",
          service_name: sName,
          products_data: order.productsData || [],
          service_group: order.serviceGroup || null,
          area: numArea,
          value: numVal,
          status: order.status || "Pendente",
          payment: order.payment || "Aguardando",
          executions: [],
          schedules: [],
          payments: [],
          logs: initialLogs,
          executed_area: 0,
          paid_amount: 0
        });
        await fetchOrders();
        toast({
          title: "Pedido criado",
          description: "O pedido foi criado com sucesso."
        });
        return created;
      } catch (backendErr: any) {
        throw backendErr;
      }
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
      const numVal = parseValue(order.value) ?? order.numericValue;
      const numArea = order.area ? parseFloat(order.area) : null;
      const sName = order.serviceName || order.type || "Serviço";

      try {
        const updated = await api.put<any>(`/orders/${order.id}`, {
          client_id: order.clientId || null,
          farm_id: order.farmId || null,
          type: order.type || "Serviço",
          service_name: sName,
          products_data: order.productsData || [],
          service_group: order.serviceGroup || null,
          area: numArea,
          value: numVal,
          status: order.status || "Pendente",
          payment: order.payment || "Aguardando",
          executions: order.executions || [],
          schedules: order.schedules || [],
          payments: order.payments || [],
          logs: order.logs || [],
          executed_area: order.executedArea || 0,
          paid_amount: order.paidAmount || 0
        });
        await fetchOrders();
        toast({
          title: "Pedido atualizado",
          description: "O pedido foi atualizado com sucesso."
        });
        return updated;
      } catch (backendErr: any) {
        throw backendErr;
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pedido",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Lifecycle action: Aprovar Pedido
  const approveOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      const appLog = createLogEntry("Aprovação", "Pedido aprovado para execução operacional");
      const updatedLogs = [...(order.logs || []), appLog];
      await updateOrder({ ...order, status: "Aprovado", logs: updatedLogs });
      toast({
        title: "Pedido Aprovado",
        description: "O pedido foi aprovado com sucesso.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao aprovar pedido",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Lifecycle action: Cancelar Pedido
  const cancelOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      const canLog = createLogEntry("Cancelamento", "Pedido cancelado no sistema");
      const updatedLogs = [...(order.logs || []), canLog];
      await updateOrder({ ...order, status: "Cancelado", logs: updatedLogs });
      toast({
        title: "Pedido Cancelado",
        description: "O pedido foi cancelado.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao cancelar pedido",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Lifecycle action: Registrar Execução (100% ou Parcial)
  const recordExecution = async (orderId: string, execution: {
    areaExecuted: number;
    notes?: string;
    collaboratorName?: string;
    collaborators?: string[];
    equipmentNames?: string[];
  }) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const totalArea = parseFloat(order.area) || 0;
      const previousExecuted = order.executedArea || 0;
      const newExecutedArea = Math.min(totalArea, previousExecuted + execution.areaExecuted);
      const percentage = totalArea > 0 ? (newExecutedArea / totalArea) * 100 : 100;

      const collabs = execution.collaborators || (execution.collaboratorName ? [execution.collaboratorName] : []);
      const equips = execution.equipmentNames || [];

      const newExecution: any = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        areaExecuted: execution.areaExecuted,
        hectares: execution.areaExecuted,
        percentage: Math.round(percentage * 100) / 100,
        notes: execution.notes,
        collaboratorName: collabs.join(', ') || execution.collaboratorName,
        collaborators: collabs,
        equipmentNames: equips,
        equipmentName: equips.join(', '),
        createdAt: new Date().toISOString()
      };

      const updatedExecutions = [...order.executions, newExecution];

      let newStatus = order.status;
      if (newExecutedArea >= totalArea && totalArea > 0) {
        newStatus = "Concluído";
      } else if (newExecutedArea > 0) {
        newStatus = "Em Andamento";
      }

      const teamStr = collabs.length > 0 ? collabs.join(', ') : (execution.collaboratorName || 'Não informado');
      const equipStr = equips.length > 0 ? equips.join(', ') : 'Padrão';
      const execLog = createLogEntry("Execução", `Execução de ${execution.areaExecuted} ha registrada (${percentage.toFixed(1)}% concluído). Equipe: ${teamStr}. Equipamentos: ${equipStr}. Obs: ${execution.notes || 'Sem observações'}`);
      const updatedLogs = [...(order.logs || []), execLog];

      await updateOrder({
        ...order,
        executions: updatedExecutions,
        executedArea: newExecutedArea,
        status: newStatus,
        logs: updatedLogs
      });

      toast({
        title: "Execução registrada",
        description: `Área executada: ${execution.areaExecuted} ha (Total: ${newExecutedArea}/${totalArea} ha - ${percentage.toFixed(1)}%)`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao registrar execução",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Lifecycle action: Agendar Visita / Etapa
  const addSchedule = async (orderId: string, schedule: {
    scheduledDate: string;
    description: string;
    collaborators?: string[];
    equipmentNames?: string[];
  }) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const collabs = schedule.collaborators || [];
      const equips = schedule.equipmentNames || [];

      const newSchedule: any = {
        id: crypto.randomUUID(),
        scheduledDate: schedule.scheduledDate,
        date: schedule.scheduledDate,
        description: schedule.description,
        notes: schedule.description,
        collaborators: collabs,
        collaborator: collabs.join(', '),
        equipmentNames: equips,
        equipment: equips.join(', '),
        status: 'Agendado',
        createdAt: new Date().toISOString()
      };

      const updatedSchedules = [...order.schedules, newSchedule];

      const teamStr = collabs.length > 0 ? ` • Equipe: ${collabs.join(', ')}` : '';
      const equipStr = equips.length > 0 ? ` • Equip: ${equips.join(', ')}` : '';
      const schedLog = createLogEntry("Agendamento", `Serviço agendado para ${schedule.scheduledDate}. Detalhes: ${schedule.description}${teamStr}${equipStr}`);
      const updatedLogs = [...(order.logs || []), schedLog];

      // Optimistic update in local state for immediate UI feedback
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        schedules: updatedSchedules,
        logs: updatedLogs
      } : o));

      await updateOrder({
        ...order,
        schedules: updatedSchedules,
        logs: updatedLogs
      });

      toast({
        title: "Agendamento registrado",
        description: `Serviço agendado para ${schedule.scheduledDate}.`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao agendar serviço",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Lifecycle action: Registrar Pagamento / Cobrança
  const recordPayment = async (orderId: string, payment: { amount: number; method: string; notes?: string }) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const orderTotal = order.numericValue || parseValue(order.value) || 0;
      const previousPaid = order.paidAmount || 0;
      const newPaidAmount = previousPaid + payment.amount;

      const newPayment: OrderPayment = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        amount: payment.amount,
        method: payment.method,
        notes: payment.notes,
        createdAt: new Date().toISOString()
      };

      const updatedPayments = [...order.payments, newPayment];

      let newPaymentStatus = order.payment;
      if (newPaidAmount >= orderTotal && orderTotal > 0) {
        newPaymentStatus = "Pago";
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "Parcial";
      }

      const payLog = createLogEntry("Pagamento", `Pagamento de ${formatCurrencyBRL(payment.amount)} registrado via ${payment.method}. Status financeiro: ${newPaymentStatus}`);
      const updatedLogs = [...(order.logs || []), payLog];

      await updateOrder({
        ...order,
        payments: updatedPayments,
        paidAmount: newPaidAmount,
        payment: newPaymentStatus,
        logs: updatedLogs
      });

      toast({
        title: "Pagamento registrado",
        description: `Valor recebido: ${formatCurrencyBRL(payment.amount)} (Total pago: ${formatCurrencyBRL(newPaidAmount)}/${formatCurrencyBRL(orderTotal)})`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao registrar pagamento",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Lifecycle action: Dar Baixa Direta
  const markOrderAsPaid = async (orderId: string, method = 'PIX') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const orderTotal = order.numericValue || parseValue(order.value) || 0;
    const remaining = Math.max(0, orderTotal - (order.paidAmount || 0));
    await recordPayment(orderId, { amount: remaining > 0 ? remaining : orderTotal, method, notes: 'Baixa integral via Financeiro' });
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
    approveOrder,
    cancelOrder,
    recordExecution,
    addSchedule,
    recordPayment,
    markOrderAsPaid,
    resetOrderForm,
    refetch: fetchOrders
  };
};

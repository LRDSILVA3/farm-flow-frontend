
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
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { generateUUID, getLocalDateISO } from "@/lib/utils";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import {
  enqueueOfflineOp,
  getSnapshot,
  getSyncQueue,
  isNetworkError,
  saveSnapshot,
} from "@/offline/offlineDb";

export interface OrderExecutionSplit {
  id: string;
  collaboratorName: string;
  equipmentName: string;
  productName?: string;
  plotName?: string;
  quantity?: number;
  unit?: string;
  areaHa: number;
}

export interface OrderPlotExecution {
  plotId: string;
  plotName: string;
  areaExecuted: number;
  samplesExecuted?: number;
}

export interface OrderExecution {
  id: string;
  date: string;
  areaExecuted: number;
  hectares?: number;
  percentage: number;
  samplesExecuted?: number;
  samplesTotal?: number;
  appliedProducts?: Array<{
    id?: string;
    name: string;
    quantity?: number;
    unit?: string;
  }>;
  splits?: OrderExecutionSplit[];
  plotExecutions?: OrderPlotExecution[];
  notes?: string;
  collaboratorName?: string;
  collaborators?: string[];
  equipmentName?: string;
  equipmentNames?: string[];
  createdAt: string;
}

export interface OrderSchedule {
  id: string;
  scheduledDate: string;
  date?: string;
  description: string;
  notes?: string;
  plotName?: string;
  plotId?: string;
  plotNames?: string[];
  yearCycle?: number;
  cycleLabel?: string;
  stageName?: string;
  collaborators?: string[];
  collaborator?: string;
  equipmentNames?: string[];
  equipment?: string;
  status: 'Agendado' | 'Realizado' | 'Cancelado';
  createdAt: string;
}

export interface OrderActionLog {
  id: string;
  action: string;
  userName: string;
  userId?: string;
  timestamp: string;
  details?: string;
  changes?: {
    field: string;
    label: string;
    before: any;
    after: any;
  }[];
}

export interface OrderPayment {
  id: string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
  createdAt: string;
}

export interface OrderPaymentSchedule {
  id: string;
  dueDate: string;              // YYYY-MM-DD
  amount: number;               // Valor da parcela
  cycleYear?: number;           // Ano do ciclo (1 a 5)
  cycleLabel?: string;          // ex: 'Ano 1 (Safra 2025/2026)'
  installmentNumber: number;    // ex: 1, 2, 3
  totalInstallments: number;    // ex: 3
  description: string;          // ex: '1ª Parcela - Safra Soja 2025/2026'
  status: 'Pendente' | 'Pago' | 'Atrasado';
  paidDate?: string;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
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
  plots?: Array<{ id: string; name: string; area?: string }>;
  serviceGroup: string;
  area: string;
  value: string;
  numericValue: number;
  status: string; // 'Pendente' | 'Aprovado' | 'Em Andamento' | 'Concluído' | 'Cancelado'
  payment: string; // 'Aguardando' | 'Parcial' | 'Pago' | 'Cancelado'
  executions: OrderExecution[];
  schedules: OrderSchedule[];
  payments: OrderPayment[];
  paymentSchedules?: OrderPaymentSchedule[];
  logs: OrderActionLog[];
  executedArea: number;
  executedSamples?: number;
  totalSamples?: number;
  paidAmount: number;
  contractYears?: number;
  serviceDetails?: any;
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
    paymentSchedules: Array.isArray(db.payment_schedules) ? db.payment_schedules : (Array.isArray(db.paymentSchedules) ? db.paymentSchedules : []),
    plots: Array.isArray(db.plots) ? db.plots : [],
    totalSamples: typeof db.total_samples === 'number' ? db.total_samples : 0,
    executedSamples: typeof db.executed_samples === 'number' ? db.executed_samples : 0,
    logs: Array.isArray(db.logs) ? db.logs : [],
    executedArea: numExecuted,
    paidAmount: numPaid,
    contractYears:
      (db as any).contract_years ||
      (db as any).contractYears ||
      (Array.isArray(db.products_data) ? (db.products_data as any)?.[0]?.contractYears || (db.products_data as any)?.[0]?.serviceDetails?.contractYears : undefined),
    serviceDetails:
      (db as any).service_details ||
      (db as any).serviceDetails ||
      (Array.isArray(db.products_data) ? (db.products_data as any)?.[0]?.serviceDetails : undefined),
    createdAt: db.created_at,
  };
};

export const useOrders = () => {
  const { toast } = useToast();
  const queryClient = useSafeQueryClient();

  const { data: orders = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const mergePendingOfflineOrders = async (baseList: Order[]): Promise<Order[]> => {
        const queue = await getSyncQueue();
        const offlineOrders: Order[] = queue
          .filter((item) => item.type === "CREATE_ORDER")
          .map((item) =>
            mapFromDB({
              ...item.payload,
              id: item.tempId,
              created_at: item.createdAt,
            })
          );
        const existingIds = new Set(baseList.map((o) => o.id));
        return [...offlineOrders.filter((o) => !existingIds.has(o.id)), ...baseList];
      };

      try {
        const backendOrders = await api.get<any[]>('/orders');
        const safeList = Array.isArray(backendOrders) ? backendOrders : [];
        await saveSnapshot('orders', safeList);
        return mergePendingOfflineOrders(safeList.map(mapFromDB));
      } catch (error: any) {
        if (isNetworkError(error)) {
          const cached = await getSnapshot<any>('orders');
          return mergePendingOfflineOrders(cached.map(mapFromDB));
        }
        toast({
          title: "Erro ao carregar pedidos",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
  }, queryClient);

  const setOrders = useCallback(
    (updater: Order[] | ((prev: Order[]) => Order[])) => {
      queryClient.setQueryData<Order[]>(["orders"], (prev = []) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    [queryClient]
  );

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
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    await refetch();
  };

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
      id: generateUUID(),
      action,
      userName,
      timestamp: new Date().toISOString(),
      details,
    };
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      if (!order.clientId || order.clientId.trim() === '') {
        throw new Error('Por favor, selecione um cliente para o pedido.');
      }
      const isProductOrder = order.type === "Produto";
      const numArea = order.area ? parseFloat(order.area) : (isProductOrder ? 0 : null);
      if (!isProductOrder && (!numArea || numArea <= 0)) {
        throw new Error('A área do pedido deve ser informada e maior que zero.');
      }
      const numVal = parseValue(order.value);
      const sName = order.serviceName || (isProductOrder ? "Venda de Produtos" : (order.type || "Serviço"));

      const initLog = createLogEntry("Criação", `Pedido criado no valor de ${formatCurrencyBRL(numVal || 0)} para o serviço ${sName}`);
      const initialLogs = order.logs && order.logs.length > 0 ? order.logs : [initLog];

      const payload = {
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
        schedules:
          (order as any).schedules && (order as any).schedules.length > 0
            ? (order as any).schedules
            : (order as any).serviceDetails?.autoPlannedSchedules || [],
        payments: [],
        payment_schedules:
          (order as any).paymentSchedules && (order as any).paymentSchedules.length > 0
            ? (order as any).paymentSchedules
            : (order as any).serviceDetails?.autoPlannedPayments || [],
        plots: (order as any).plots || [],
        total_samples: (order as any).totalSamples || 0,
        executed_samples: (order as any).executedSamples || 0,
        logs: initialLogs,
        executed_area: 0,
        paid_amount: 0
      };

      const saveOfflineOrder = async () => {
        const tempId = `offline-order-${generateUUID()}`;
        const parentTempId =
          order.farmId && order.farmId.startsWith("offline-")
            ? order.farmId
            : order.clientId && order.clientId.startsWith("offline-")
            ? order.clientId
            : undefined;

        await enqueueOfflineOp({
          type: "CREATE_ORDER",
          tempId,
          parentTempId,
          label: `${sName} (${formatCurrencyBRL(numVal || 0)})`,
          payload: { ...payload, status: "Pendente" },
        });

        const localOrder = mapFromDB({
          ...payload,
          id: tempId,
          status: "Pendente",
          created_at: new Date().toISOString(),
        });
        setOrders((prev) => [localOrder, ...prev]);

        toast({
          title: "Pedido gerado no Modo Offline!",
          description: `Pedido salvo localmente (${formatCurrencyBRL(numVal || 0)}). Você já pode imprimir/gerar PDF e ele será sincronizado quando houver internet.`,
        });
        return localOrder;
      };

      const hasOfflineRef =
        (order.clientId && order.clientId.startsWith("offline-")) ||
        (order.farmId && order.farmId.startsWith("offline-"));

      if ((typeof navigator !== "undefined" && !navigator.onLine) || hasOfflineRef) {
        return saveOfflineOrder();
      }

      try {
        const created = await api.post<any>('/orders', payload);
        await fetchOrders();
        await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        await queryClient.invalidateQueries({ queryKey: ["order-audit", created?.id] });
        toast({
          title: "Pedido criado",
          description: "O pedido foi criado com sucesso."
        });
        return created;
      } catch (backendErr: any) {
        if (isNetworkError(backendErr)) {
          return saveOfflineOrder();
        }
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
      if (!order.clientId || order.clientId.trim() === '') {
        throw new Error('Por favor, selecione um cliente para o pedido.');
      }
      const isProductOrder = order.type === "Produto";
      const numArea = order.area ? parseFloat(order.area) : (isProductOrder ? 0 : null);
      if (!isProductOrder && (!numArea || numArea <= 0)) {
        throw new Error('A área do pedido deve ser informada e maior que zero.');
      }
      const numVal = parseValue(order.value) ?? order.numericValue;
      const sName = order.serviceName || (isProductOrder ? "Venda de Produtos" : (order.type || "Serviço"));

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
          payment_schedules: (order as any).paymentSchedules || [],
          plots: (order as any).plots || [],
          total_samples: (order as any).totalSamples || 0,
          executed_samples: (order as any).executedSamples || 0,
          logs: order.logs || [],
          executed_area: order.executedArea || 0,
          paid_amount: order.paidAmount || 0
        });
        await fetchOrders();
        await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        await queryClient.invalidateQueries({ queryKey: ["order-audit", order.id] });
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
      return null;
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

  // Lifecycle action: Registrar Execução (100% ou Parcial, com rateio por operador e análises)
  const recordExecution = async (orderId: string, execution: {
    areaExecuted: number;
    samplesExecuted?: number;
    samplesTotal?: number;
    splits?: OrderExecutionSplit[];
    plotExecutions?: OrderPlotExecution[];
    appliedProducts?: Array<{ id?: string; name: string; quantity?: number; unit?: string }>;
    notes?: string;
    collaboratorName?: string;
    collaborators?: string[];
    equipmentNames?: string[];
  }) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const isPending =
        order.status === 'Pendente' ||
        order.status === 'pending' ||
        order.status === 'Aguardando' ||
        order.status === 'Aguardando Aprovação' ||
        order.status === 'Cancelado';

      if (isPending) {
        toast({
          title: "Pedido Aguardando Aprovação",
          description: "O pedido não pode ser executado enquanto não for aprovado. Aprove o pedido primeiro.",
          variant: "destructive",
        });
        throw new Error("O pedido não pode ser executado pois está aguardando aprovação.");
      }

      const totalArea = parseFloat(order.area) || 0;
      const previousExecutedArea = order.executedArea || 0;
      const newExecutedArea = Math.min(totalArea, previousExecutedArea + execution.areaExecuted);
      const percentage = totalArea > 0 ? (newExecutedArea / totalArea) * 100 : 100;

      const previousExecutedSamples = order.executedSamples || 0;
      const stepSamples = execution.samplesExecuted || 0;
      const newExecutedSamples = previousExecutedSamples + stepSamples;
      const totalSamples = execution.samplesTotal || order.totalSamples || 0;

      const collabs = execution.collaborators || (execution.collaboratorName ? [execution.collaboratorName] : []);
      const equips = execution.equipmentNames || [];
      const splits = execution.splits || [];

      const plotExecutions = execution.plotExecutions || [];

      const newExecution: OrderExecution = {
        id: generateUUID(),
        date: getLocalDateISO(),
        areaExecuted: execution.areaExecuted,
        hectares: execution.areaExecuted,
        percentage: Math.round(percentage * 100) / 100,
        samplesExecuted: stepSamples > 0 ? stepSamples : undefined,
        samplesTotal: totalSamples > 0 ? totalSamples : undefined,
        splits: splits.length > 0 ? splits : undefined,
        plotExecutions: plotExecutions.length > 0 ? plotExecutions : undefined,
        appliedProducts: execution.appliedProducts,
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

      // Detalhamento para os logs
      const teamStr = collabs.length > 0 ? collabs.join(', ') : (execution.collaboratorName || 'Não informado');
      const equipStr = equips.length > 0 ? equips.join(', ') : 'Padrão';
      const sampleStr = stepSamples > 0 ? ` • ${stepSamples}/${totalSamples} análises realizadas` : '';
      const plotStr =
        plotExecutions.length > 0
          ? ' • Talhões: ' +
            plotExecutions
              .map(
                (pe) =>
                  `${pe.plotName} (${pe.areaExecuted} ha${pe.samplesExecuted ? `, ${pe.samplesExecuted} pts` : ''})`
              )
              .join(', ')
          : '';
      
      let splitStr = '';
      if (splits.length > 0) {
        splitStr = ' • Rateio: ' + splits.map(s => 
          `${s.collaboratorName} (${s.equipmentName || 'Máq'}): ${s.quantity ? s.quantity + ' ' + (s.unit || 'Ton') + ' de ' : ''}${s.productName || 'Aplicação'} em ${s.areaHa} ha`
        ).join('; ');
      }

      const execLog = createLogEntry("Execução", `Execução de ${execution.areaExecuted} ha registrada (${percentage.toFixed(1)}% da área). Equipe: ${teamStr}.${plotStr}${sampleStr}${splitStr}. Obs: ${execution.notes || 'Sem observações'}`);
      const updatedLogs = [...(order.logs || []), execLog];

      await updateOrder({
        ...order,
        executions: updatedExecutions,
        executedArea: newExecutedArea,
        executedSamples: newExecutedSamples,
        totalSamples: totalSamples > 0 ? totalSamples : order.totalSamples,
        status: newStatus,
        logs: updatedLogs
      });

      // Dispara persistência de splits em paralelo no endpoint de execuções do backend
      if (splits.length > 0) {
        Promise.all(splits.map(sp => 
          api.post(`/orders/${order.id}/executions`, {
            operator_name: sp.collaboratorName,
            equipment_name: sp.equipmentName,
            area_ha: sp.areaHa,
            product_name: sp.productName,
            quantity: sp.quantity,
            unit: sp.unit,
            plot_name: sp.plotName,
            execution_date: getLocalDateISO(),
            notes: `${sp.productName || 'Produto'}: ${sp.quantity || ''} ${sp.unit || ''} em ${sp.areaHa} ha (${sp.plotName || 'Talhão'})`
          }).catch(err => console.warn("Erro ao persistir split no backend:", err))
        ));
      }

      toast({
        title: "Execução registrada com sucesso",
        description: `Área: ${execution.areaExecuted} ha (${newExecutedArea}/${totalArea} ha)${stepSamples > 0 ? ` • Análises: +${stepSamples} (${newExecutedSamples}/${totalSamples})` : ''}`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao registrar execução",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Lifecycle action: Agendar Visita / Etapa (com suporte a talhão e ciclos do Equaliza)
  const addSchedule = async (orderId: string, schedule: {
    scheduledDate: string;
    description: string;
    plotName?: string;
    plotId?: string;
    plotNames?: string[];
    yearCycle?: number;
    cycleLabel?: string;
    stageName?: string;
    collaborators?: string[];
    equipmentNames?: string[];
  }) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const isPending =
        order.status === 'Pendente' ||
        order.status === 'pending' ||
        order.status === 'Aguardando' ||
        order.status === 'Aguardando Aprovação' ||
        order.status === 'Cancelado';

      if (isPending) {
        toast({
          title: "Pedido Aguardando Aprovação",
          description: "O pedido não pode ser agendado enquanto não for aprovado. Aprove o pedido primeiro.",
          variant: "destructive",
        });
        throw new Error("O pedido não pode ser agendado pois está aguardando aprovação.");
      }

      const collabs = schedule.collaborators || [];
      const equips = schedule.equipmentNames || [];

      const newSchedule: OrderSchedule = {
        id: generateUUID(),
        scheduledDate: schedule.scheduledDate,
        date: schedule.scheduledDate,
        description: schedule.description,
        notes: schedule.description,
        plotName: schedule.plotName || (schedule.plotNames && schedule.plotNames.join(', ')),
        plotId: schedule.plotId,
        plotNames: schedule.plotNames,
        yearCycle: schedule.yearCycle,
        cycleLabel: schedule.cycleLabel,
        stageName: schedule.stageName,
        collaborators: collabs,
        collaborator: collabs.join(', '),
        equipmentNames: equips,
        equipment: equips.join(', '),
        status: 'Agendado',
        createdAt: new Date().toISOString()
      };

      const updatedSchedules = [...order.schedules, newSchedule];

      const plotStr = newSchedule.plotName ? ` • Talhão: ${newSchedule.plotName}` : '';
      const cycleStr = newSchedule.cycleLabel ? ` • Ciclo: ${newSchedule.cycleLabel}` : '';
      const teamStr = collabs.length > 0 ? ` • Equipe: ${collabs.join(', ')}` : '';
      const equipStr = equips.length > 0 ? ` • Equip: ${equips.join(', ')}` : '';
      const schedLog = createLogEntry("Agendamento", `Serviço agendado para ${schedule.scheduledDate}. Detalhes: ${schedule.description}${plotStr}${cycleStr}${teamStr}${equipStr}`);
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
  const recordPayment = async (
    orderId: string,
    payment: { amount: number; method: string; notes?: string; date?: string }
  ) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const orderTotal = order.numericValue || parseValue(order.value) || 0;
      const previousPaid = order.paidAmount || 0;
      const newPaidAmount = previousPaid + payment.amount;
      const paymentDate = payment.date || getLocalDateISO();

      const newPayment: OrderPayment = {
        id: generateUUID(),
        date: paymentDate,
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

      // Sincroniza recebimento no Fluxo de Caixa (/financial/transactions)
      try {
        await api.post('/financial/transactions', {
          order_id: order.id,
          client_id: order.clientId || null,
          type: 'income',
          category: 'Serviços Agrícolas',
          amount: payment.amount,
          description: `Recebimento Pedido #${order.id.slice(0, 8)} - ${order.serviceName || order.type}`,
          due_date: paymentDate,
          payment_date: paymentDate,
          status: 'paid',
          payment_method: payment.method,
          notes: order.client?.name || payment.notes || 'Cliente'
        });
        await queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      } catch (syncErr) {
        console.warn("Erro ao sincronizar recebimento no fluxo de caixa:", syncErr);
      }

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
  const markOrderAsPaid = async (
    orderId: string,
    paymentDetails: string | { amount?: number; method: string; notes?: string; date?: string } = 'PIX'
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const orderTotal = order.numericValue || parseValue(order.value) || 0;
    const remaining = Math.max(0, orderTotal - (order.paidAmount || 0));
    const opts = typeof paymentDetails === 'string'
      ? { method: paymentDetails }
      : paymentDetails;
    const amount = opts.amount !== undefined ? opts.amount : (remaining > 0 ? remaining : orderTotal);
    await recordPayment(orderId, {
      amount,
      method: opts.method || 'PIX',
      notes: opts.notes || 'Baixa integral via Financeiro',
      date: opts.date
    });
  };

  // Lifecycle action: Salvar Cronograma de Pagamentos das Safras (Equaliza & Multianual)
  const savePaymentSchedules = async (
    orderId: string,
    paymentSchedules: OrderPaymentSchedule[]
  ) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const scheduleLog = createLogEntry(
        "Cronograma Financeiro",
        `Cronograma de pagamentos atualizado: ${paymentSchedules.length} parcelas/safras agendadas.`
      );
      const updatedLogs = [...(order.logs || []), scheduleLog];

      await updateOrder({
        ...order,
        paymentSchedules,
        logs: updatedLogs
      });

      toast({
        title: "Cronograma de Pagamento Salvo",
        description: `${paymentSchedules.length} parcelas de safras programadas com sucesso.`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao salvar cronograma de pagamento",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Lifecycle action: Dar Baixa Direta em Parcela Agendada
  const payScheduledInstallment = async (
    orderId: string,
    scheduleId: string,
    paymentData: { amount: number; method: string; date?: string; notes?: string }
  ) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const schedules = order.paymentSchedules || [];
      const targetSched = schedules.find(s => s.id === scheduleId);
      const amountToPay = paymentData.amount || targetSched?.amount || 0;
      const paymentDate = paymentData.date || getLocalDateISO();

      const updatedSchedules: OrderPaymentSchedule[] = schedules.map(s => {
        if (s.id === scheduleId) {
          return {
            ...s,
            status: 'Pago' as const,
            paidDate: paymentDate,
            paidAmount: amountToPay,
            paymentMethod: paymentData.method,
            notes: paymentData.notes || s.notes
          };
        }
        return s;
      });

      const newPayment: OrderPayment = {
        id: generateUUID(),
        date: paymentDate,
        amount: amountToPay,
        method: paymentData.method,
        notes: paymentData.notes || `${targetSched?.description || 'Parcela'} quitada`,
        createdAt: new Date().toISOString()
      };

      const updatedPayments = [...order.payments, newPayment];
      const orderTotal = order.numericValue || parseValue(order.value) || 0;
      const newPaidAmount = (order.paidAmount || 0) + amountToPay;

      let newPaymentStatus = order.payment;
      if (newPaidAmount >= orderTotal && orderTotal > 0) {
        newPaymentStatus = "Pago";
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "Parcial";
      }

      const payLog = createLogEntry(
        "Pagamento",
        `Baixa na parcela "${targetSched?.description || scheduleId}" de ${formatCurrencyBRL(amountToPay)} via ${paymentData.method}.`
      );
      const updatedLogs = [...(order.logs || []), payLog];

      await updateOrder({
        ...order,
        payments: updatedPayments,
        paymentSchedules: updatedSchedules,
        paidAmount: newPaidAmount,
        payment: newPaymentStatus,
        logs: updatedLogs
      });

      // Sincroniza recebimento no Fluxo de Caixa (/financial/transactions)
      try {
        await api.post('/financial/transactions', {
          order_id: order.id,
          client_id: order.clientId || null,
          type: 'income',
          category: 'Serviços Agrícolas',
          amount: amountToPay,
          description: `Recebimento Parcela ${targetSched?.description || ''} - Pedido #${order.id.slice(0, 8)}`,
          due_date: targetSched?.dueDate || paymentDate,
          payment_date: paymentDate,
          status: 'paid',
          payment_method: paymentData.method,
          notes: order.client?.name || paymentData.notes || 'Cliente'
        });
        await queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      } catch (syncErr) {
        console.warn("Erro ao sincronizar recebimento no fluxo de caixa:", syncErr);
      }

      toast({
        title: "Parcela Quitada com Sucesso",
        description: `Recebido: ${formatCurrencyBRL(amountToPay)} (${targetSched?.description || 'Parcela'})`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao quitar parcela",
        description: err.message,
        variant: "destructive",
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
    approveOrder,
    cancelOrder,
    recordExecution,
    addSchedule,
    recordPayment,
    savePaymentSchedules,
    payScheduledInstallment,
    markOrderAsPaid,
    resetOrderForm,
    refetch: fetchOrders
  };
};

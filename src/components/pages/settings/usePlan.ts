
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Plan {
  id: number;
  name: string;
  description: string;
  recurrence: "mensal" | "unico";
  status: "Ativo" | "Inativo";
  value: number;
  servicesIds: number[];
  creationDate: string;
}

const STORAGE_KEY_PLANS = "farm_flow_app_plans_v1";

const DEFAULT_PLANS: Plan[] = [
  {
    id: 1,
    name: "Plano Básico",
    description: "Pacote básico de serviços agrícolas",
    recurrence: "mensal",
    status: "Ativo",
    value: 299.90,
    servicesIds: [1, 2],
    creationDate: "15/01/2024"
  },
  {
    id: 2,
    name: "Plano Completo",
    description: "Pacote completo com todos os serviços",
    recurrence: "mensal",
    status: "Ativo",
    value: 599.90,
    servicesIds: [1, 2, 3, 4],
    creationDate: "10/01/2024"
  }
];

export const usePlan = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PLANS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_PLANS;
  });

  const persistPlans = (next: Plan[]) => {
    setPlans(next);
    try {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(next));
    } catch {}
  };

  // Catálogo de serviços oficiais sincronizados com o modelo de negócio
  const [services] = useState([
    { id: 1, name: "Amostragem de Solo (AP)" },
    { id: 2, name: "Conferência" },
    { id: 3, name: "Coleta Foliar" },
    { id: 4, name: "Compactação de Solo" },
    { id: 5, name: "Voo de Drone (Mapeamento)" },
    { id: 6, name: "Pulverização com Drone" },
    { id: 7, name: "Aplicação ATV" },
    { id: 8, name: "Sistema Equaliza" }
  ]);

  const [plansPage, setPlansPage] = useState(1);
  const [plansPerPage, setPlansPerPage] = useState(10);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planFormData, setPlanFormData] = useState<Plan>({
    id: 0,
    name: "",
    description: "",
    recurrence: "mensal",
    status: "Ativo",
    value: 0,
    servicesIds: [],
    creationDate: ""
  });

  // Pagination calculations
  const plansStartIndex = (plansPage - 1) * plansPerPage;
  const plansEndIndex = plansStartIndex + plansPerPage;
  const currentPlans = plans.slice(plansStartIndex, plansEndIndex);
  const totalPlans = plans.length;
  const totalPlansPages = Math.ceil(totalPlans / plansPerPage);

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanFormData(plan);
    setShowPlanForm(true);
  };

  const handlePlanSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      persistPlans(plans.map(p => p.id === editingPlan.id ? { ...planFormData, id: editingPlan.id } : p));
      toast({ title: "Plano atualizado", description: "As alterações foram salvas." });
    } else {
      const created: Plan = {
        ...planFormData,
        id: Date.now(),
        creationDate: new Date().toLocaleDateString("pt-BR")
      };
      persistPlans([created, ...plans]);
      toast({ title: "Plano criado", description: "O novo plano foi cadastrado." });
    }
    resetPlanForm();
  };

  const resetPlanForm = () => {
    setShowPlanForm(false);
    setEditingPlan(null);
    setPlanFormData({
      id: 0,
      name: "",
      description: "",
      recurrence: "mensal",
      status: "Ativo",
      value: 0,
      servicesIds: [],
      creationDate: ""
    });
  };

  const handlePlanInputChange = (field: keyof Plan, value: string | number | number[]) => {
    setPlanFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: number) => {
    setPlanFormData(prev => ({
      ...prev,
      servicesIds: prev.servicesIds.includes(serviceId)
        ? prev.servicesIds.filter(id => id !== serviceId)
        : [...prev.servicesIds, serviceId]
    }));
  };

  return {
    plans,
    services,
    currentPlans,
    plansStartIndex,
    plansEndIndex,
    totalPlans,
    plansPerPage,
    setPlansPerPage,
    plansPage,
    setPlansPage,
    totalPlansPages,
    handleEditPlan,
    showPlanForm,
    setShowPlanForm,
    editingPlan,
    planFormData,
    handlePlanSubmit,
    resetPlanForm,
    handlePlanInputChange,
    handleServiceToggle
  };
};

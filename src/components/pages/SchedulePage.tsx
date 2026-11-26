const formatServiceName = (name: string | null | undefined): string => {
  if (!name) return 'Serviço';
  let s = String(name);
  s = s.replace(/Equaliza[?\uFFFD]?o\s+de\s+Servi[?\uFFFD]?os/gi, 'Equaliza');
  s = s.replace(/Equaliza[?\uFFFD]?o|EqualizaÃ§Ã£o|Equalizao/gi, 'Equaliza');
  s = s.replace(/Sistema\s+Equaliza/gi, 'Equaliza');
  return s;
};

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DecimalInput } from "@/components/ui/decimal-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Edit,
  Plus,
  Trash2,
  Users,
  Wrench,
  CheckCircle2,
  Clock,
  X,
  ChevronRight,
  Search,
  DollarSign,
  FlaskConical,
  AlertTriangle,
  RotateCcw,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { SoilSamplingService } from "@/services/SoilSamplingService";
import { useCostVariables } from "@/hooks/useCostVariables";
import { cn, getLocalDateISO } from "@/lib/utils";
import { MultiStatusFilter } from "@/components/ui/multi-status-filter";

interface CollaboratorOption {
  id: string;
  name: string;
  role?: string;
}

interface EquipmentOption {
  id: string;
  name: string;
  type?: string;
}

interface OperatorEquipmentSplit {
  id: string;
  collaboratorName: string;
  equipmentName: string;
  productName?: string;
  plotName?: string;
  quantity?: number;
  unit?: string;
  areaHa: number;
}

interface PartialExecution {
  id: string;
  date: string;
  executedArea: string;
  equipmentNames: string[];
  collaborators: string[];
  splits?: OperatorEquipmentSplit[];
  notes: string;
  status: string;
}

interface Execution {
  id: string;
  orderId?: string;
  clientName: string;
  clientId: string;
  farmName: string;
  farmId: string;
  city?: string;
  state?: string;
  serviceName: string;
  area: string;
  value?: string;
  numericValue?: number;
  scheduledDate: string;
  equipmentNames: string[];
  collaborators: string[];
  status: string;
  paymentStatus?: string;
  notes?: string;
  responsibleName?: string;
  creatorName?: string;
  partialExecutions: PartialExecution[];
  productsData?: any[];
  rawOrder?: any;
}

const statusOptions = ["Todos", "Pendente", "Agendado", "Em Andamento", "Concluído", "Cancelado"];

// Componente para seleção múltipla com chips / badges
interface MultiSelectChipsProps {
  label: string;
  icon?: React.ReactNode;
  availableOptions: { id: string; name: string; subtitle?: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  label,
  icon,
  availableOptions,
  selectedValues,
  onChange,
  placeholder = "Selecione..."
}) => {
  const [customInput, setCustomInput] = useState("");

  const toggleOption = (name: string) => {
    if (selectedValues.includes(name)) {
      onChange(selectedValues.filter(v => v !== name));
    } else {
      onChange([...selectedValues, name]);
    }
  };

  const addCustom = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const val = customInput.trim();
    if (val && !selectedValues.includes(val)) {
      onChange([...selectedValues, val]);
      setCustomInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-xs font-semibold">
        {icon}
        {label}
      </Label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-muted/40 border rounded-md min-h-[42px] items-center">
        {selectedValues.map((val) => (
          <Badge
            key={val}
            variant="secondary"
            className="flex items-center gap-1 text-xs py-0.5 px-2 bg-background border shadow-xs"
          >
            <span>{val}</span>
            <button
              type="button"
              onClick={() => toggleOption(val)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selectedValues.length === 0 && !customInput && (
          <span className="text-xs text-muted-foreground italic px-1">{placeholder}</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={`Digite outro(a) ${label.toLowerCase()} e aperte Enter...`}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={addCustom}
          className="text-xs h-8"
        />
        <Button type="button" size="sm" variant="outline" onClick={addCustom} className="h-8 text-xs">
          Adicionar
        </Button>
      </div>

      {availableOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 border rounded bg-background">
          {availableOptions.map((opt) => {
            const isSelected = selectedValues.includes(opt.name);
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => toggleOption(opt.name)}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 hover:bg-muted text-foreground border-border"
                }`}
              >
                {opt.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SchedulePage = () => {
  const { toast } = useToast();
  const { costVariables } = useCostVariables();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros Avançados
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [filterFarm, setFilterFarm] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [filterCollaborator, setFilterCollaborator] = useState("all");
  const [filterEquipment, setFilterEquipment] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

  const [collaboratorsList, setCollaboratorsList] = useState<CollaboratorOption[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentOption[]>([]);
  const [farmsList, setFarmsList] = useState<any[]>([]);

  // Modais
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isFinanceCompletionModalOpen, setIsFinanceCompletionModalOpen] = useState(false);
  const [isIncludeAnalysesModalOpen, setIsIncludeAnalysesModalOpen] = useState(false);

  // Form State: Nova Execução com Rateio
  const [partialExecutionForm, setPartialExecutionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    executedArea: "",
    equipmentNames: [] as string[],
    collaborators: [] as string[],
    notes: "",
  });

  const [executionSplits, setExecutionSplits] = useState<OperatorEquipmentSplit[]>([]);
  const [splitOperator, setSplitOperator] = useState("");
  const [splitEquipment, setSplitEquipment] = useState("");
  const [splitProduct, setSplitProduct] = useState("");
  const [splitQuantity, setSplitQuantity] = useState("");
  const [splitUnit, setSplitUnit] = useState("Ton");
  const [splitPlot, setSplitPlot] = useState("");
  const [splitArea, setSplitArea] = useState("");

  // Form State: Conclusão Financeira
  const [financeCompletionForm, setFinanceCompletionForm] = useState({
    isPartial: false,
    isSurplusArea: false,
    surplusAreaHa: 0,
    surplusAreaValue: 0,
    pricePerHa: 0,
    executedPercentage: 100,
    originalValue: 0,
    suggestedValue: 0,
    baseSuggestedValue: 0,
    finalValue: "",
    adjustmentNote: "",
    hasSurplusSamples: false,
    contractedSamples: 0,
    actualSentSamples: 0,
    surplusSamplesQty: 0,
    surplusEstimatedValue: 0,
    surplusDetails: "",
  });

  // Form State: Incluir Análises Recomendadas (suporte a importação parcial, total e análises extras)
  const [recommendedAnalysesList, setRecommendedAnalysesList] = useState<Array<{
    type: string;
    description?: string;
    suggestedQty: number;
    alreadyImportedQty: number;
    remainingQty: number;
    currentQty: number;
    unitPrice: number;
    isModified: boolean;
    isExtra?: boolean;
  }>>([]);
  const [includeAnalysesPartialMode, setIncludeAnalysesPartialMode] = useState<boolean>(false);
  const [includeAnalysesExecId, setIncludeAnalysesExecId] = useState<string>("all");
  const [includeAnalysesPlotId, setIncludeAnalysesPlotId] = useState<string>("geral");
  const [includeAnalysesAlreadyImportedExecIds, setIncludeAnalysesAlreadyImportedExecIds] = useState<string[]>([]);
  const [loadingIncludeAnalyses, setLoadingIncludeAnalyses] = useState<boolean>(false);
  const [extraAnalysisType, setExtraAnalysisType] = useState<string>("");
  const [extraAnalysisCustomName, setExtraAnalysisCustomName] = useState<string>("");
  const [extraAnalysisQty, setExtraAnalysisQty] = useState<number>(1);
  const [analysesCountByOrderId, setAnalysesCountByOrderId] = useState<Record<string, number>>({});
  const [orderExistingAnalysesList, setOrderExistingAnalysesList] = useState<any[]>([]);
  const [analysesModalTab, setAnalysesModalTab] = useState<string>("new");

  // Form State: Agendamento Geral
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: "",
    collaborators: [] as string[],
    equipmentNames: [] as string[],
    status: "Agendado",
    notes: ""
  });

  useEffect(() => {
    fetchExecutions();
    fetchEquipment();
    fetchCollaborators();
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const data = await api.get<any[]>('/farms');
      if (Array.isArray(data)) {
        setFarmsList(data);
      }
    } catch {}
  };

  const fetchCollaborators = async () => {
    try {
      const data = await api.get<any[]>('/collaborators');
      if (Array.isArray(data)) {
        setCollaboratorsList(data.map(c => ({
          id: c.id,
          name: c.name || "Colaborador",
          role: c.role || "Operador"
        })));
      }
    } catch {
      setCollaboratorsList([
        { id: "1", name: "Almir", role: "Operador de Trator / ATV" },
        { id: "2", name: "Maicon", role: "Piloto de Drone" },
        { id: "3", name: "Carlos", role: "Técnico Amostrador" }
      ]);
    }
  };

  const fetchEquipment = async () => {
    try {
      const data = await api.get<any[]>('/equipment');
      if (Array.isArray(data)) {
        setEquipmentList(data.map(e => ({
          id: e.id,
          name: e.name || "Equipamento",
          type: e.type || "Máquina"
        })));
      }
    } catch {
      setEquipmentList([
        { id: "1", name: "Quadriciclo ATV 01", type: "Veículo" },
        { id: "2", name: "Quadriciclo ATV 02", type: "Veículo" },
        { id: "3", name: "Drone DJI Agras T40", type: "Drone" },
        { id: "4", name: "Trator Valtra A950", type: "Veículo" }
      ]);
    }
  };

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const [orders, allAnalyses] = await Promise.all([
        api.get<any[]>('/orders'),
        api.get<any[]>('/analyses').catch(() => [])
      ]);

      if (Array.isArray(allAnalyses)) {
        const counts: Record<string, number> = {};
        allAnalyses.forEach((a) => {
          if (a.order_id) {
            const q = Number(a.results?.quantity ?? a.quantity ?? 1) || 1;
            counts[a.order_id] = (counts[a.order_id] || 0) + q;
          }
        });
        setAnalysesCountByOrderId(counts);
      }

      if (Array.isArray(orders)) {
        // Pedidos pendentes de aprovação não entram no fluxo de agenda ou execução operacional
        const approvedOrders = orders.filter(o => {
          const st = (o.status || '').toLowerCase();
          return st !== 'pendente' && st !== 'aguardando' && st !== 'aguardando aprovação' && st !== 'cancelado';
        });
        const mapped: Execution[] = approvedOrders.map(o => {
          const rawSchedules = Array.isArray(o.schedules) ? o.schedules : [];
          const rawExecutions = Array.isArray(o.executions) ? o.executions : [];
          const latestSchedule = rawSchedules[rawSchedules.length - 1];

          return {
            id: o.id,
            orderId: o.id,
            clientName: o.client?.name || o.client_name || "Cliente",
            clientId: o.client_id || "",
            farmName: o.farm?.name || o.farm_name || "Fazenda",
            farmId: o.farm_id || "",
            city: o.farm?.city || o.city || "-",
            state: o.farm?.state || o.state || "-",
            serviceName: formatServiceName(o.service_name || o.service || o.type || "Serviço Geral"),
            area: (o.area !== null && o.area !== undefined) ? String(o.area) : "0",
            value: o.value ? String(o.value) : "0",
            numericValue: typeof o.value === 'number' ? o.value : (parseFloat(String(o.value || "0").replace(/[^0-9.]/g, '')) || 0),
            scheduledDate: latestSchedule?.date || latestSchedule?.scheduledDate || (o.created_at ? o.created_at.split('T')[0] : ""),
            equipmentNames: Array.isArray(latestSchedule?.equipmentNames) ? latestSchedule.equipmentNames : (latestSchedule?.equipmentName ? [latestSchedule.equipmentName] : []),
            collaborators: Array.isArray(latestSchedule?.collaborators) ? latestSchedule.collaborators : (latestSchedule?.collaboratorName ? [latestSchedule.collaboratorName] : []),
            status: o.status || "Pendente",
            paymentStatus: o.payment || "Aguardando",
            notes: latestSchedule?.notes || latestSchedule?.description || "",
            responsibleName: o.responsible_name || o.responsibleName || o.creator_name || o.creatorName || o.user?.name || "Sem Responsável",
            creatorName: o.creator_name || o.creatorName || o.user?.name || "",
            productsData: Array.isArray(o.products_data) ? o.products_data : (Array.isArray(o.productsData) ? o.productsData : []),
            rawOrder: o,
            partialExecutions: rawExecutions.map(e => ({
              id: e.id || String(Date.now()),
              date: e.date || getLocalDateISO(),
              executedArea: String(e.areaExecuted || e.hectares || e.executedArea || "0"),
              equipmentNames: Array.isArray(e.equipmentNames) ? e.equipmentNames : (e.equipmentName ? [e.equipmentName] : []),
              collaborators: Array.isArray(e.collaborators) ? e.collaborators : (e.collaboratorName ? [e.collaboratorName] : []),
              splits: Array.isArray(e.splits) ? e.splits : [],
              notes: e.notes || "",
              status: e.status || "Concluída"
            }))
          };
        });
        setExecutions(mapped);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agenda",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Listas únicas para filtros
  const uniqueClients = useMemo(() => Array.from(new Set(executions.map(e => e.clientName))).filter(Boolean), [executions]);
  const uniqueFarms = useMemo(() => Array.from(new Set(executions.map(e => e.farmName))).filter(Boolean), [executions]);
  const uniqueServices = useMemo(() => Array.from(new Set(executions.map(e => e.serviceName))).filter(Boolean), [executions]);
  const uniqueStates = useMemo(() => Array.from(new Set(executions.map(e => e.state))).filter(s => s && s !== "-"), [executions]);
  const uniqueCities = useMemo(() => Array.from(new Set(executions.map(e => e.city))).filter(c => c && c !== "-"), [executions]);
  const uniqueResponsibles = useMemo(() => {
    const names = new Set<string>();
    executions.forEach((e) => {
      if (e.responsibleName && e.responsibleName !== "Sem Responsável" && e.responsibleName.trim() !== "") {
        names.add(e.responsibleName.trim());
      }
    });
    return Array.from(names).sort();
  }, [executions]);

  // Filtragem combinada
  const filteredExecutions = useMemo(() => {
    return executions.filter(e => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesQuery =
          e.clientName.toLowerCase().includes(q) ||
          e.farmName.toLowerCase().includes(q) ||
          e.serviceName.toLowerCase().includes(q) ||
          (e.responsibleName && e.responsibleName.toLowerCase().includes(q)) ||
          (e.city && e.city.toLowerCase().includes(q)) ||
          (e.state && e.state.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      if (filterClient !== "all" && e.clientName !== filterClient) return false;
      if (filterFarm !== "all" && e.farmName !== filterFarm) return false;
      if (filterService !== "all" && e.serviceName !== filterService) return false;
      if (filterResponsible !== "all" && (e.responsibleName || "").toLowerCase().trim() !== filterResponsible.toLowerCase().trim()) return false;
      if (filterState !== "all" && e.state !== filterState) return false;
      if (filterCity !== "all" && e.city !== filterCity) return false;
      if (filterStatus.length === 0) {
        if (e.status === "Cancelado") return false;
      } else if (!filterStatus.includes(e.status)) {
        return false;
      }

      if (filterCollaborator !== "all" && !e.collaborators.includes(filterCollaborator)) return false;
      if (filterEquipment !== "all" && !e.equipmentNames.includes(filterEquipment)) return false;

      return true;
    });
  }, [executions, searchTerm, filterClient, filterFarm, filterService, filterResponsible, filterCollaborator, filterEquipment, filterState, filterCity, filterStatus]);

  // Identifica se o serviço selecionado é uma aplicação que envolve produtos (ATV, Pulverização, Insumos)
  const isSelectedApplicationService = useMemo(() => {
    if (!selectedExecution) return false;
    const service = (selectedExecution.serviceName || selectedExecution.type || '').toLowerCase();
    
    // Serviços que NÃO possuem aplicação de insumos/produtos:
    if (
      service.includes('amostragem') ||
      service.includes('amostr') ||
      service.includes('conferência') ||
      service.includes('conferencia') ||
      service.includes('compactação') ||
      service.includes('compactacao') ||
      service.includes('mapeamento') ||
      service.includes('foliar') ||
      service.includes('equaliza')
    ) {
      return false;
    }

    // Serviços de aplicação:
    return (
      service.includes('atv') ||
      service.includes('pulveriz') ||
      service.includes('biol') ||
      service.includes('aplica') ||
      selectedExecution.type === 'Produto' ||
      (Array.isArray(selectedExecution.productsData) &&
        selectedExecution.productsData.some(
          (p: any) => p.produto || (p.unit && ['Ton', 'Kg', 'L', 'L/ha', 'Kg/ha', 'sc'].includes(p.unit))
        ))
    );
  }, [selectedExecution]);

  // Extrai prioritariamente os produtos definidos na ordem/pedido
  const availableExecutionProducts = useMemo(() => {
    if (!selectedExecution) return [];
    const found: string[] = [];
    const pData = selectedExecution.productsData || [];
    if (Array.isArray(pData)) {
      pData.forEach((p: any) => {
        if (p.produto && typeof p.produto === 'string') {
          found.push(p.produto);
        } else if (
          p.name &&
          !p.name.toLowerCase().includes('serviço') &&
          !p.name.toLowerCase().includes('análise') &&
          !p.name.toLowerCase().includes('analise') &&
          !p.name.toLowerCase().includes('coleta') &&
          !p.id?.startsWith('servico_') &&
          p.unit !== 'ALQ' &&
          p.unit !== 'PTOS'
        ) {
          found.push(p.name);
        }
      });
    }

    if (found.length === 0) {
      const sName = (selectedExecution.serviceName || selectedExecution.type || '').toLowerCase();
      if (sName.includes('atv')) {
        return [
          'Calcário Dolomítico',
          'Calcário Calcítico',
          'Gesso Agrícola',
          'Cama de Frango',
          'Pó de Rocha',
          'KCl (Cloreto de Potássio)',
          'Superfosfato Simples (SSP)',
          'Ureia Agrícola 46% N',
          'Adjuvante Espalhante Adesivo',
          'Biológico Trichoderma Harzianum',
        ];
      }
      return [];
    }

    return Array.from(new Set(found));
  }, [selectedExecution]);

  // Extrai talhões disponíveis para o apontamento (da ordem ou da fazenda)
  const availableExecutionPlots = useMemo(() => {
    if (!selectedExecution) return [];
    const list: Array<{ id: string; name: string; area?: number }> = [];

    // 1. Plots cadastrados diretamente na ordem
    const orderPlots = selectedExecution.rawOrder?.plots;
    if (Array.isArray(orderPlots) && orderPlots.length > 0) {
      orderPlots.forEach((p: any, idx: number) => {
        if (typeof p === 'string' && p.trim()) {
          list.push({ id: `order-plot-${idx}`, name: p.trim() });
        } else if (p && p.name) {
          list.push({ id: p.id || `order-plot-${idx}`, name: p.name, area: p.area ? Number(p.area) : undefined });
        }
      });
    }

    // 2. Plots da fazenda selecionada
    const farmId = selectedExecution.farmId || selectedExecution.rawOrder?.farm_id || selectedExecution.rawOrder?.farm?.id;
    const farmName = selectedExecution.farmName || selectedExecution.rawOrder?.farm?.name;
    const farm = farmsList.find((f: any) => (farmId && f.id === farmId) || (farmName && f.name?.toLowerCase() === farmName?.toLowerCase()));

    if (farm && Array.isArray(farm.plots)) {
      farm.plots.forEach((p: any) => {
        if (p && p.name && !list.some(existing => existing.name.toLowerCase() === p.name.toLowerCase())) {
          list.push({ id: p.id, name: p.name, area: p.area ? Number(p.area) : undefined });
        }
      });
    }

    if (list.length === 0) {
      list.push(
        { id: 'default-1', name: 'Talhão 01' },
        { id: 'default-2', name: 'Talhão 02' },
        { id: 'default-3', name: 'Talhão 03' },
        { id: 'default-4', name: 'Talhão 04' },
        { id: 'default-sede', name: 'Área da Sede' }
      );
    }

    return list;
  }, [selectedExecution, farmsList]);

  // Abrir Modal de Nova Execução com preenchimento automático do saldo restante
  const openExecutionModal = (execution: Execution) => {
    if ((execution.status || '').toLowerCase() === 'pendente') {
      toast({
        title: "Pedido Aguardando Aprovação",
        description: "Este pedido não pode ser executado enquanto não for aprovado.",
        variant: "destructive"
      });
      return;
    }
    setSelectedExecution(execution);
    const totalArea = parseFloat(execution.area || "0");
    const alreadyDone = execution.partialExecutions.reduce((sum, p) => sum + (parseFloat(p.executedArea) || 0), 0);
    const remaining = Math.max(0, totalArea - alreadyDone);

    setPartialExecutionForm({
      date: getLocalDateISO(),
      executedArea: remaining > 0 ? remaining.toFixed(2) : "",
      equipmentNames: [...execution.equipmentNames],
      collaborators: [...execution.collaborators],
      notes: ""
    });
    setExecutionSplits([]);
    setSplitOperator(execution.collaborators[0] || "");
    setSplitEquipment(execution.equipmentNames[0] || "");

    // Inicializa produto se for serviço de aplicação
    const pData = execution.productsData || [];
    const prodsFound: string[] = [];
    if (Array.isArray(pData)) {
      pData.forEach((p: any) => {
        if (p.produto) prodsFound.push(p.produto);
        else if (p.name && !p.name.toLowerCase().includes('serviço') && !p.name.toLowerCase().includes('análise') && p.unit !== 'ALQ' && p.unit !== 'PTOS') {
          prodsFound.push(p.name);
        }
      });
    }
    setSplitProduct(prodsFound[0] || "");
    setSplitQuantity("");

    // Inicializa talhão
    const orderPlots = execution.rawOrder?.plots;
    const farmId = execution.farmId || execution.rawOrder?.farm_id || execution.rawOrder?.farm?.id;
    const farmName = execution.farmName || execution.rawOrder?.farm?.name;
    const farm = farmsList.find((f: any) => (farmId && f.id === farmId) || (farmName && f.name?.toLowerCase() === farmName?.toLowerCase()));
    const firstPlot =
      (Array.isArray(orderPlots) && orderPlots.length > 0 ? (typeof orderPlots[0] === 'string' ? orderPlots[0] : orderPlots[0]?.name) : null) ||
      (farm && Array.isArray(farm.plots) && farm.plots.length > 0 ? farm.plots[0]?.name : "");

    setSplitPlot(firstPlot || "");
    setSplitArea("");
    setIsExecutionModalOpen(true);
  };

  // Adicionar linha de rateio (Operador + Máquina + Produto + Qtd + Área ha)
  const handleAddSplit = () => {
    const areaNum = parseFloat(splitArea) || 0;
    const qtdNum = parseFloat(splitQuantity) || 0;
    if (!splitOperator || !splitEquipment || (areaNum <= 0 && qtdNum <= 0)) {
      toast({
        title: "Dados incompletos no rateio",
        description: "Selecione o operador, equipamento e informe a quantidade ou área.",
        variant: "destructive"
      });
      return;
    }

    const newSplit: OperatorEquipmentSplit = {
      id: Date.now().toString(),
      collaboratorName: splitOperator,
      equipmentName: splitEquipment,
      productName: splitProduct || undefined,
      plotName: splitPlot || undefined,
      quantity: qtdNum > 0 ? qtdNum : undefined,
      unit: splitUnit,
      areaHa: areaNum
    };

    const updatedSplits = [...executionSplits, newSplit];
    setExecutionSplits(updatedSplits);

    // Soma automaticamente a área dos rateios
    const totalSplitArea = updatedSplits.reduce((sum, s) => sum + s.areaHa, 0);
    if (totalSplitArea > 0) {
      setPartialExecutionForm(prev => ({
        ...prev,
        executedArea: totalSplitArea.toFixed(2),
        collaborators: Array.from(new Set([...prev.collaborators, splitOperator])),
        equipmentNames: Array.from(new Set([...prev.equipmentNames, splitEquipment]))
      }));
    }

    setSplitQuantity("");
    setSplitArea("");
  };

  const handleRemoveSplit = (splitId: string) => {
    const updated = executionSplits.filter(s => s.id !== splitId);
    setExecutionSplits(updated);
    if (updated.length > 0) {
      const sum = updated.reduce((acc, s) => acc + s.areaHa, 0);
      setPartialExecutionForm(prev => ({ ...prev, executedArea: sum.toFixed(2) }));
    }
  };

  // Salvar Apontamento de Execução Parcial ou Total
  const handleAddPartialExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExecution) return;
    if ((selectedExecution.status || '').toLowerCase() === 'pendente') {
      toast({
        title: "Pedido Aguardando Aprovação",
        description: "Este pedido precisa ser aprovado antes de registrar execuções.",
        variant: "destructive"
      });
      return;
    }

    const areaNum = parseFloat(partialExecutionForm.executedArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      toast({ title: "Área inválida", description: "Informe uma área válida maior que 0.", variant: "destructive" });
      return;
    }

    try {
      const newPartial: PartialExecution = {
        id: Date.now().toString(),
        date: partialExecutionForm.date,
        executedArea: partialExecutionForm.executedArea,
        equipmentNames: partialExecutionForm.equipmentNames,
        collaborators: partialExecutionForm.collaborators,
        splits: executionSplits.length > 0 ? executionSplits : undefined,
        notes: partialExecutionForm.notes,
        status: "Concluída"
      };

      const updatedPartials = [...selectedExecution.partialExecutions, newPartial];
      const totalExec = updatedPartials.reduce((sum, p) => sum + parseFloat(p.executedArea || "0"), 0);

      // IMPORTANTE: 100% de execução física NÃO conclui o financeiro automaticamente! Mantém 'Em Andamento' até conclusão formal
      const updatedStatus = "Em Andamento";

      await api.put(`/orders/${selectedExecution.id}`, {
        executed_area: totalExec,
        status: updatedStatus,
        executions: updatedPartials.map(p => ({
          id: p.id,
          date: p.date,
          hectares: parseFloat(p.executedArea),
          areaExecuted: parseFloat(p.executedArea),
          equipmentNames: p.equipmentNames,
          collaborators: p.collaborators,
          splits: p.splits,
          notes: p.notes,
          status: p.status
        }))
      });

      // Persiste rateios de operadores e equipamentos no banco de dados
      if (executionSplits.length > 0) {
        Promise.all(executionSplits.map(s => 
          api.post(`/orders/${selectedExecution.id}/executions`, {
            operator_name: s.collaboratorName,
            equipment_name: s.equipmentName,
            area_ha: s.areaHa,
            product_name: s.productName,
            quantity: s.quantity,
            unit: s.unit,
            plot_name: s.plotName,
            execution_date: partialExecutionForm.date,
            notes: `${s.productName || 'Aplicação'}: ${s.quantity ? s.quantity + ' ' + (s.unit || 'Ton') : ''} em ${s.areaHa} ha (${s.plotName || 'Talhão'})`
          }).catch(err => console.warn('Erro ao salvar split no backend:', err))
        ));
      } else {
        api.post(`/orders/${selectedExecution.id}/executions`, {
          operator_name: partialExecutionForm.collaborators[0] || 'Equipe Geral',
          equipment_name: partialExecutionForm.equipmentNames[0] || 'Geral',
          area_ha: areaNum,
          execution_date: partialExecutionForm.date,
          notes: partialExecutionForm.notes
        }).catch(err => console.warn('Erro ao salvar execução no backend:', err));
      }

      toast({
        title: "Apontamento registrado!",
        description: `Registrado ${areaNum.toFixed(2)} ha com sucesso. Total executado: ${totalExec.toFixed(2)} ha.`
      });

      setIsExecutionModalOpen(false);
      fetchExecutions();
    } catch (err: any) {
      toast({ title: "Erro ao salvar execução", description: err.message, variant: "destructive" });
    }
  };

  // Modal de Conclusão Financeira (Total ou Parcial) com verificação automática de área e amostras excedentes
  const openFinanceCompletionModal = async (execution: Execution) => {
    setSelectedExecution(execution);
    const totalArea = parseFloat(execution.area || "0");
    const totalExec = execution.partialExecutions.reduce((sum, p) => sum + (parseFloat(p.executedArea) || 0), 0);
    const isPartial = totalArea > 0 && totalExec < totalArea - 0.001;
    const isSurplusArea = totalArea > 0 && totalExec > totalArea + 0.001;
    const surplusAreaHa = isSurplusArea ? Number((totalExec - totalArea).toFixed(2)) : 0;
    const ratio = totalArea > 0 ? (totalExec / totalArea) : 1;
    const origVal = execution.numericValue || 0;
    const pricePerHa = totalArea > 0 && origVal > 0 ? Number((origVal / totalArea).toFixed(2)) : 0;
    const surplusAreaValue = isSurplusArea ? Number((surplusAreaHa * (origVal / totalArea)).toFixed(2)) : 0;

    // 1. Amostras contratadas / previstas no pedido
    const rawOrder = execution.rawOrder || {};
    const products = execution.productsData || rawOrder.products_data || [];
    let contractedSamples = Number(rawOrder.total_samples || rawOrder.totalSamples || 0);

    if (contractedSamples <= 0 && Array.isArray(products) && products.length > 0) {
      contractedSamples = products
        .filter((p: any) => {
          const id = (p.id || '').toLowerCase();
          const name = (p.name || '').toLowerCase();
          const type = (p.type || '').toUpperCase();
          return (
            id.includes('analise') ||
            id.includes('amostr') ||
            name.includes('análise') ||
            name.includes('analise') ||
            name.includes('amostragem') ||
            name.includes('ponto') ||
            type.includes('MACRO') ||
            type.includes('FOLIAR') ||
            type.includes('BIOAS') ||
            type.includes('FISICA') ||
            p.unit === 'PTOS'
          );
        })
        .reduce((acc: number, p: any) => acc + (Number(p.quantity) || 0), 0);
    }

    const serviceNameLower = (execution.serviceName || '').toLowerCase();
    const isSoilSamplingService =
      serviceNameLower.includes('solo') ||
      serviceNameLower.includes('amostragem') ||
      serviceNameLower.includes('conferência') ||
      serviceNameLower.includes('conferencia');

    if (contractedSamples <= 0 && isSoilSamplingService && totalArea > 0) {
      contractedSamples = Math.max(1, Math.round(totalArea / 2.95) || 10);
    }

    // 2. Amostras efetivamente enviadas ao laboratório (ou coletadas no campo)
    let orderAnalyses: any[] = [];
    try {
      const allAnalyses = await api.get<any[]>('/analyses').catch(() => []);
      if (Array.isArray(allAnalyses)) {
        orderAnalyses = allAnalyses.filter(
          (a) => a.order_id === execution.orderId || a.order_id === execution.id
        );
      }
    } catch {}

    const labSentSamples = orderAnalyses.reduce((sum, a) => {
      const q = Number(a.results?.quantity ?? a.quantity ?? 1) || 1;
      return sum + q;
    }, 0);

    const fieldExecSamples = (rawOrder.executions || execution.partialExecutions || []).reduce(
      (sum: number, e: any) => sum + (Number(e.samplesExecuted ?? e.samples ?? 0) || 0),
      0
    );

    const actualSentSamples = labSentSamples > 0 ? labSentSamples : fieldExecSamples;
    const surplusSamplesQty = contractedSamples > 0 ? Math.max(0, actualSentSamples - contractedSamples) : 0;
    const hasExtraAnalyses = orderAnalyses.some((a) => a.results?.isExtra || a.results?.financialTag?.includes('Extra'));
    const hasSurplusSamples = surplusSamplesQty > 0 || hasExtraAnalyses;

    // 3. Detalhes de análises extras e cálculo financeiro estritamente pelo valor unitário da análise de laboratório
    const getAnalysisUnitPrice = (type: string, analysisObj?: any): number => {
      if (analysisObj?.results?.unitPrice && Number(analysisObj.results.unitPrice) > 0) {
        return Number(analysisObj.results.unitPrice);
      }
      if (Array.isArray(products) && products.length > 0) {
        const foundProd = products.find((p: any) => {
          const pName = (p.name || '').toUpperCase();
          const pType = (p.type || '').toUpperCase();
          const tUpper = (type || '').toUpperCase();
          return pName.includes(tUpper) || pType.includes(tUpper) || tUpper.includes(pType);
        });
        if (foundProd && Number(foundProd.price || foundProd.unitPrice) > 0) {
          return Number(foundProd.price || foundProd.unitPrice);
        }
      }
      const tUpper = (type || '').toUpperCase();
      if (tUpper.includes('BIOAS')) return getCostVar('VALOR_LAB_BIOAS', 205.20);
      if (tUpper.includes('FOLIAR') || tUpper.includes('FOLHA')) return getCostVar('VALOR_ANALISE_FOLIAR', 90.00);
      if (tUpper.includes('20-40') || tUpper.includes('PROFUNDIDADE') || tUpper === 'MACRO+S') {
        return getCostVar('ANALISE_20_40_CM_VALOR_ANALISE', 73.90);
      }
      if (tUpper.includes('FISICA') || tUpper.includes('FÍSICA')) return getCostVar('VALOR_ANALISE_FISICA_UNITARIO', 33.30);
      if (tUpper.includes('MICRONUTRIENTE')) return getCostVar('VALOR_ANALISE_MICRONUTRIENTES', 29.55);
      if (tUpper.includes('COMPLETA') || tUpper.includes('MACRO+S+P_REM')) return getCostVar('VALOR_ANALISE_COMPLETA_UNITARIO', 91.40);
      if (tUpper.includes('MACRO')) return getCostVar('ANALISE_MACRO_VALOR_ANALISE', 61.40);
      return getCostVar('VALOR_ANALISE_COMPLETA_UNITARIO', 91.40);
    };

    const extraTypesMap = new Map<string, { qty: number; unitPrice: number }>();
    let surplusEstimatedValue = 0;

    if (surplusSamplesQty > 0) {
      let remainingSurplusToPrice = surplusSamplesQty;
      for (const a of orderAnalyses) {
        if (remainingSurplusToPrice <= 0) break;
        const t = a.type || 'MACRO+S+P_REM';
        const q = Number(a.results?.quantity ?? a.quantity ?? 1) || 1;
        const uPrice = getAnalysisUnitPrice(t, a);
        const alloc = Math.min(remainingSurplusToPrice, q);
        surplusEstimatedValue += alloc * uPrice;
        remainingSurplusToPrice -= alloc;

        const existing = extraTypesMap.get(t) || { qty: 0, unitPrice: uPrice };
        extraTypesMap.set(t, { qty: existing.qty + alloc, unitPrice: uPrice });
      }

      if (remainingSurplusToPrice > 0) {
        const fallbackPrice = getCostVar('VALOR_ANALISE_COMPLETA_UNITARIO', 91.40);
        surplusEstimatedValue += remainingSurplusToPrice * fallbackPrice;
        const existing = extraTypesMap.get('Análise Completa') || { qty: 0, unitPrice: fallbackPrice };
        extraTypesMap.set('Análise Completa', { qty: existing.qty + remainingSurplusToPrice, unitPrice: fallbackPrice });
      }
      surplusEstimatedValue = Number(surplusEstimatedValue.toFixed(2));
    } else if (hasExtraAnalyses) {
      orderAnalyses.forEach((a) => {
        if (a.results?.isExtra || a.results?.financialTag?.includes('Extra')) {
          const t = a.type || 'Análise Extra';
          const q = Number(a.results?.quantity ?? a.quantity ?? 1) || 1;
          const uPrice = getAnalysisUnitPrice(t, a);
          const existing = extraTypesMap.get(t) || { qty: 0, unitPrice: uPrice };
          extraTypesMap.set(t, { qty: existing.qty + q, unitPrice: uPrice });
          surplusEstimatedValue += q * uPrice;
        }
      });
      surplusEstimatedValue = Number(surplusEstimatedValue.toFixed(2));
    }

    const detailsArray: string[] = [];
    extraTypesMap.forEach(({ qty, unitPrice }, type) => {
      detailsArray.push(`${type}: ${qty} un × R$ ${unitPrice.toFixed(2)}`);
    });

    // 4. Montagem da nota automática de fechamento
    const notesParts: string[] = [];
    if (isPartial) {
      notesParts.push(`Execução parcial aprovada com ${totalExec.toFixed(2)} de ${totalArea.toFixed(2)} ha contratados.`);
    } else if (isSurplusArea) {
      notesParts.push(
        `Acréscimo de área executada: ${totalExec.toFixed(2)} ha executados no campo (${totalArea.toFixed(2)} ha previstos no contrato, +${surplusAreaHa.toFixed(2)} ha excedentes a R$ ${surplusAreaValue.toFixed(2)}).`
      );
    }

    if (surplusSamplesQty > 0) {
      const detailsText = detailsArray.length > 0 ? ` [${detailsArray.join(', ')}]` : '';
      notesParts.push(
        `Acréscimo de análises laboratoriais: ${actualSentSamples} amostras enviadas (${contractedSamples} previstas no pedido, +${surplusSamplesQty} excedentes a R$ ${surplusEstimatedValue.toFixed(2)})${detailsText}.`
      );
    } else if (extraTypesMap.size > 0) {
      const extrasDesc = detailsArray.join(', ');
      notesParts.push(`Amostras extras fora do orçamento enviadas ao laboratório: ${extrasDesc} (+R$ ${surplusEstimatedValue.toFixed(2)}).`);
    }

    const autoAdjustmentNote = notesParts.join(' ');
    const baseSuggested = isPartial
      ? Number((origVal * ratio).toFixed(2))
      : isSurplusArea
      ? Number((origVal + surplusAreaValue).toFixed(2))
      : origVal;
    const finalSuggested = Number((baseSuggested + surplusEstimatedValue).toFixed(2));
    const executedPercentage = totalArea > 0 ? Math.round(ratio * 100) : 100;

    setFinanceCompletionForm({
      isPartial,
      isSurplusArea,
      surplusAreaHa,
      surplusAreaValue,
      pricePerHa,
      executedPercentage,
      originalValue: origVal,
      suggestedValue: finalSuggested,
      baseSuggestedValue: baseSuggested,
      finalValue: finalSuggested.toFixed(2),
      adjustmentNote: autoAdjustmentNote,
      hasSurplusSamples,
      contractedSamples,
      actualSentSamples,
      surplusSamplesQty,
      surplusEstimatedValue,
      surplusDetails: detailsArray.join(', '),
    });

    setIsFinanceCompletionModalOpen(true);
  };

  const handleConfirmFinanceCompletion = async () => {
    if (!selectedExecution) return;
    const finalValNum = parseFloat(financeCompletionForm.finalValue);
    if (isNaN(finalValNum) || finalValNum < 0) {
      toast({ title: "Valor financeiro inválido", variant: "destructive" });
      return;
    }

    try {
      await api.put(`/orders/${selectedExecution.id}`, {
        status: "Concluído",
        payment: "Aguardando",
        value: finalValNum,
        financial_notes: financeCompletionForm.adjustmentNote,
        ...(financeCompletionForm.actualSentSamples > 0 ? { executed_samples: financeCompletionForm.actualSentSamples } : {})
      });

      toast({
        title: "Serviço Concluído e Enviado ao Financeiro!",
        description: `Valor de R$ ${finalValNum.toFixed(2)} registrado para faturamento.${financeCompletionForm.hasSurplusSamples ? ' Nota de amostras excedentes incluída.' : ''}`
      });

      setIsFinanceCompletionModalOpen(false);
      fetchExecutions();
    } catch (err: any) {
      toast({ title: "Erro ao concluir serviço", description: err.message, variant: "destructive" });
    }
  };

  const getCostVar = (code: string, fallback: number): number => {
    const found = (costVariables || []).find((v: any) => v.code === code);
    const val = found ? Number(found.value) : 0;
    return val > 0 ? val : fallback;
  };

  // Modal de Inclusão de Análises Recomendadas da Planilha (com suporte a serviço parcial, BIOAS e saldo restante)
  const openIncludeAnalysesModal = async (execution: Execution) => {
    setSelectedExecution(execution);
    setIncludeAnalysesExecId("all");
    setIncludeAnalysesPlotId("geral");
    setExtraAnalysisType("");
    setExtraAnalysisCustomName("");
    setExtraAnalysisQty(1);
    const isOrderPartial =
      (execution.status || "").toLowerCase() === "em andamento" ||
      (execution.partialExecutions && execution.partialExecutions.length > 0 && (execution.status || "").toLowerCase() !== "concluído");
    setIncludeAnalysesPartialMode(isOrderPartial);
    setLoadingIncludeAnalyses(true);
    setAnalysesModalTab("new");
    setIsIncludeAnalysesModalOpen(true);

    // Busca análises já importadas anteriormente para este pedido (controle de saldo parcial)
    const importedByType = new Map<string, number>();
    const importedExecIds: string[] = [];
    if (execution.orderId) {
      try {
        const allAnalyses = await api.get<any[]>('/analyses').catch(() => []);
        if (Array.isArray(allAnalyses)) {
          const orderAnalyses = allAnalyses.filter((a) => a.order_id === execution.orderId);
          setOrderExistingAnalysesList(orderAnalyses);
          orderAnalyses.forEach((a) => {
            const t = a.type || "";
            const q = Number(a.results?.quantity ?? a.quantity ?? 0) || 0;
            if (t && q > 0) {
              importedByType.set(t, (importedByType.get(t) || 0) + q);
            }
            if (a.results?.executionId) {
              importedExecIds.push(a.results.executionId);
            }
          });
        }
      } catch {}
    }
    setIncludeAnalysesAlreadyImportedExecIds(importedExecIds);
    setLoadingIncludeAnalyses(false);

    const areaHa = parseFloat(execution.area || "0") || 0;
    const alq = areaHa > 0 ? areaHa / 2.42 : 0;
    const service = (execution.serviceName || "").toLowerCase();

    // Preços dinâmicos das variáveis de custo 2026
    const priceCompleta = getCostVar('VALOR_ANALISE_COMPLETA_UNITARIO', 91.40);
    const priceMacro = getCostVar('ANALISE_MACRO_VALOR_ANALISE', getCostVar('VALOR_ANALISE_NOVA_AREA', 61.40));
    const price20_40 = getCostVar('ANALISE_20_40_CM_VALOR_ANALISE', 73.90);
    const priceFisica = getCostVar('VALOR_ANALISE_FISICA_UNITARIO', 33.30);
    const priceBioas = getCostVar('VALOR_LAB_BIOAS', 205.20);
    const priceFoliar = getCostVar('VALOR_ANALISE_FOLIAR', 90.00);

    // 1. Extração prioritária a partir dos produtos gravados no pedido (productsData)
    const products = execution.productsData || [];
    let macroSPRemQty: number | null = null;
    let macroSQty: number | null = null;
    let macroQty: number | null = null;
    let foliarQty: number | null = null;
    let fisicaQty: number | null = null;
    let bioasQty: number | null = null;

    if (Array.isArray(products) && products.length > 0) {
      for (const p of products) {
        const id = (p.id || "").toLowerCase();
        const t = (p.type || "").toUpperCase();
        const n = (p.name || "").toUpperCase();
        const q = parseInt(p.quantity?.toString() || "0") || 0;

        if (id.startsWith("servico_") || t.startsWith("SERVICO_") || p.unit === "ALQ") {
          continue;
        }
        if (id === "analises_bioas" || t === "BIOAS" || n.includes("BIOAS")) {
          bioasQty = (bioasQty || 0) + q;
        } else if (t === "MACRO+S+P_REM" || n.includes("MACRO+S+P_REM") || n.includes("COMPLETA")) {
          macroSPRemQty = (macroSPRemQty || 0) + q;
        } else if (t === "MACRO+S" || n.includes("20-40") || n.includes("PROFUNDIDADE")) {
          macroSQty = (macroSQty || 0) + q;
        } else if (t === "MACRO" || (n.includes("MACRO") && !n.includes("+") && !n.includes("20-40"))) {
          macroQty = (macroQty || 0) + q;
        } else if (t === "ANALISE DE FOLIAR" || t.includes("FOLIAR") || n.includes("FOLIAR") || n.includes("FOLHA")) {
          foliarQty = (foliarQty || 0) + q;
        } else if (t.includes("FISICA") || n.includes("FÍSICA") || n.includes("FISICA")) {
          fisicaQty = (fisicaQty || 0) + q;
        }
      }
    }

    const rawItems: Array<{
      type: string;
      description?: string;
      suggestedQty: number;
      unitPrice: number;
    }> = [];

    if (service.includes("solo") || service.includes("ap") || service.includes("amostragem")) {
      let calcCompleta = 0;
      let calcMacro = 0;
      let calc20_40 = 0;
      let calcFisica = 0;

      if (macroSPRemQty !== null || macroQty !== null || macroSQty !== null) {
        calcCompleta = macroSPRemQty || 0;
        calcMacro = macroQty || 0;
        calc20_40 = macroSQty || 0;
        calcFisica = fisicaQty || 0;
      } else {
        let points = 0;
        if (alq > 0) {
          if (alq < 5) points = Math.floor(alq) + 1;
          else if (alq < 10) points = Math.floor((alq * 2.42) / 2.5) + 1;
          else points = Math.floor((alq * 2.42) / 3) + 1;
        }
        if (points <= 0) points = Math.max(1, Math.round(areaHa / 2.95) || 10);

        try {
          const serviceCalc = new SoilSamplingService(costVariables || []);
          const calcRes = serviceCalc.calculate({
            isReanalise: false,
            comNotaFiscal: true,
            alqueires: alq > 0 ? alq : 10,
            numPontos: points,
            desejaAduboBase: true,
            desejaEnxofre: true,
            desejaMicronutrientes: true,
            desejaAnalise20_40cm: true,
            desejaAnaliseFisica: false,
            valorFechadoManual: execution.numericValue && execution.numericValue > 0 ? execution.numericValue : undefined,
          });

          calcCompleta = calcRes.details.numAnalisesCompleta;
          calcMacro = calcRes.details.numAnalisesMacro;
          calc20_40 = calcRes.details.numAnalises20_40cm;
          calcFisica = calcRes.details.numAnalisesFisicas;
        } catch {
          calcCompleta = points;
          calcMacro = 0;
          calc20_40 = Math.max(1, Math.round(points * 0.1));
        }
      }

      rawItems.push({ type: "MACRO+S+P_REM", description: "Completa (0-20 cm)", suggestedQty: calcCompleta, unitPrice: priceCompleta });
      rawItems.push({ type: "MACRO", description: "Simples (0-20 cm)", suggestedQty: calcMacro, unitPrice: priceMacro });
      rawItems.push({ type: "MACRO+S", description: "Profundidade (20-40 cm)", suggestedQty: calc20_40, unitPrice: price20_40 });
      if (calcFisica > 0) {
        rawItems.push({ type: "ANÁLISE FÍSICA", description: "Granulometria (% Argila)", suggestedQty: calcFisica, unitPrice: priceFisica });
      }
      if (bioasQty && bioasQty > 0) {
        rawItems.push({ type: "ANÁLISE BIOAS", description: "Biológica do Solo", suggestedQty: bioasQty, unitPrice: priceBioas });
      }
    } else if (service.includes("confer") || service.includes("conferência")) {
      let confPoints = macroSPRemQty;
      if (confPoints === null || confPoints <= 0) {
        confPoints = alq > 0 ? (alq <= 10 ? 10 : Math.round(alq)) : 10;
      }
      let depthPoints = macroSQty;
      if (depthPoints === null) {
        depthPoints = Math.round(confPoints * 0.1) <= 1 ? 1 : Math.round(confPoints * 0.1);
      }

      rawItems.push({ type: "MACRO+S+P_REM", description: "Completa (0-20 cm)", suggestedQty: confPoints, unitPrice: priceCompleta });
      rawItems.push({ type: "MACRO+S", description: "Profundidade (20-40 cm)", suggestedQty: depthPoints, unitPrice: price20_40 });
      if (bioasQty && bioasQty > 0) {
        rawItems.push({ type: "ANÁLISE BIOAS", description: "Biológica do Solo", suggestedQty: bioasQty, unitPrice: priceBioas });
      }
      rawItems.push({ type: "MACRO", description: "Simples", suggestedQty: macroQty || 0, unitPrice: priceMacro });
      if (fisicaQty && fisicaQty > 0) {
        rawItems.push({ type: "ANÁLISE FÍSICA", description: "Física", suggestedQty: fisicaQty, unitPrice: priceFisica });
      }
    } else if (service.includes("foliar") || service.includes("folha")) {
      let leafPoints = foliarQty;
      if (leafPoints === null || leafPoints <= 0) {
        leafPoints = Math.max(1, Math.round(areaHa / 10) || 5);
      }
      rawItems.push({ type: "ANALISE DE FOLIAR", description: "Nutrição Foliar", suggestedQty: leafPoints, unitPrice: priceFoliar });
    } else {
      rawItems.push({ type: "MACRO+S+P_REM", description: "Completa (0-20 cm)", suggestedQty: macroSPRemQty || 0, unitPrice: priceCompleta });
      rawItems.push({ type: "MACRO+S", description: "Profundidade (20-40 cm)", suggestedQty: macroSQty || 0, unitPrice: price20_40 });
      rawItems.push({ type: "MACRO", description: "Simples", suggestedQty: macroQty || 0, unitPrice: priceMacro });
      if (bioasQty && bioasQty > 0) {
        rawItems.push({ type: "ANÁLISE BIOAS", description: "Biológica do Solo", suggestedQty: bioasQty, unitPrice: priceBioas });
      }
    }

    const list = rawItems.map((item) => {
      const alreadyImportedQty = importedByType.get(item.type) || 0;
      const remainingQty = Math.max(0, item.suggestedQty - alreadyImportedQty);
      return {
        ...item,
        alreadyImportedQty,
        remainingQty,
        currentQty: remainingQty,
        isModified: false,
      };
    });

    setRecommendedAnalysesList(list);
  };

  const handleSelectPartialStageForAnalyses = (execId: string) => {
    setIncludeAnalysesExecId(execId);
    setIncludeAnalysesPlotId("geral");
    if (!selectedExecution) return;

    if (execId === "all") {
      setRecommendedAnalysesList((prev) =>
        prev.map((item) => ({
          ...item,
          currentQty: item.remainingQty,
          isModified: false,
        }))
      );
      return;
    }

    setIncludeAnalysesPartialMode(true);
    const rawExecs: any[] = Array.isArray(selectedExecution.rawOrder?.executions)
      ? selectedExecution.rawOrder.executions
      : [];
    const execObj = rawExecs.find((e: any) => e.id === execId);
    const execSamples = Number(execObj?.samplesExecuted) || 0;
    const orderArea = parseFloat(selectedExecution.area || "0") || 0;
    const execArea = Number(execObj?.areaExecuted || execObj?.hectares) || 0;

    setRecommendedAnalysesList((prev) => {
      if (execSamples > 0) {
        let left = execSamples;
        return prev.map((item) => {
          const alloc = Math.min(item.remainingQty, Math.max(0, left));
          left -= alloc;
          return { ...item, currentQty: alloc, isModified: false };
        });
      }
      const ratio = orderArea > 0 && execArea > 0 ? Math.min(1, execArea / orderArea) : 1;
      return prev.map((item) => ({
        ...item,
        currentQty: Math.min(item.remainingQty, Math.max(0, Math.round(item.suggestedQty * ratio))),
        isModified: false,
      }));
    });
  };

  const EXTRA_ANALYSIS_CATALOG = [
    { type: "MACRO+S+P_REM", description: "Completa (0-20 cm)", varCode: "VALOR_ANALISE_COMPLETA_UNITARIO", fallbackPrice: 91.40 },
    { type: "MACRO", description: "Simples (0-20 cm)", varCode: "ANALISE_MACRO_VALOR_ANALISE", fallbackPrice: 61.40 },
    { type: "MACRO+S", description: "Profundidade (20-40 cm)", varCode: "ANALISE_20_40_CM_VALOR_ANALISE", fallbackPrice: 73.90 },
    { type: "ANÁLISE FÍSICA", description: "Granulometria (% Argila)", varCode: "VALOR_ANALISE_FISICA_UNITARIO", fallbackPrice: 33.30 },
    { type: "ANÁLISE BIOAS", description: "Biológica do Solo", varCode: "VALOR_LAB_BIOAS", fallbackPrice: 205.20 },
    { type: "ANALISE DE FOLIAR", description: "Nutrição Foliar", varCode: "VALOR_ANALISE_FOLIAR", fallbackPrice: 90.00 },
    { type: "MICRONUTRIENTES", description: "Adicional Micronutrientes", varCode: "VALOR_ANALISE_MICRONUTRIENTES", fallbackPrice: 29.55 },
    { type: "NEMATOIDES", description: "Análise Nematológica", varCode: "", fallbackPrice: 0 },
  ];

  const handleAddExtraAnalysis = () => {
    if (!extraAnalysisType) return;
    const isCustom = extraAnalysisType === "__CUSTOM__";
    const finalType = isCustom ? extraAnalysisCustomName.trim().toUpperCase() : extraAnalysisType;
    if (!finalType) return;
    const qty = Math.max(1, extraAnalysisQty || 1);

    const existingIdx = recommendedAnalysesList.findIndex((i) => i.type.toUpperCase() === finalType.toUpperCase());
    if (existingIdx >= 0) {
      setRecommendedAnalysesList((prev) => {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          currentQty: updated[existingIdx].currentQty + qty,
          isModified: true,
        };
        return updated;
      });
    } else {
      const cat = EXTRA_ANALYSIS_CATALOG.find((c) => c.type === finalType);
      const unitPrice = cat && cat.varCode ? getCostVar(cat.varCode, cat.fallbackPrice) : 0;
      setRecommendedAnalysesList((prev) => [
        ...prev,
        {
          type: finalType,
          description: cat?.description || "Análise Avulsa / Extra",
          suggestedQty: 0,
          alreadyImportedQty: 0,
          remainingQty: 0,
          currentQty: qty,
          unitPrice,
          isModified: true,
          isExtra: true,
        },
      ]);
    }

    setExtraAnalysisType("");
    setExtraAnalysisCustomName("");
    setExtraAnalysisQty(1);
  };

  const handleRemoveExtraAnalysis = (idx: number) => {
    setRecommendedAnalysesList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmIncludeAnalyses = async () => {
    if (!selectedExecution) return;
    const itemsToSave = recommendedAnalysesList.filter((i) => i.currentQty > 0);
    if (itemsToSave.length === 0) {
      toast({
        title: "Nenhuma quantidade informada",
        description: "Informe ao menos 1 amostra para importar.",
        variant: "destructive",
      });
      return;
    }

    const rawPlots: any[] = Array.isArray(selectedExecution.rawOrder?.plots)
      ? selectedExecution.rawOrder.plots
      : [];
    const selectedPlotObj = rawPlots.find(
      (p: any) => (p.id || p.name) === includeAnalysesPlotId
    );
    const plotId = includeAnalysesPlotId !== "geral" && selectedPlotObj?.id ? selectedPlotObj.id : null;
    const plotName = selectedPlotObj?.name || (includeAnalysesPlotId !== "geral" ? includeAnalysesPlotId : "Geral");

    const isPartialShipment =
      includeAnalysesPartialMode ||
      includeAnalysesExecId !== "all" ||
      recommendedAnalysesList.some((i) => i.currentQty < i.remainingQty);

    try {
      for (const item of itemsToSave) {
        const exceedsContracted = item.alreadyImportedQty + item.currentQty > item.suggestedQty;
        const isCommercialDiff = exceedsContracted || (!isPartialShipment && item.currentQty !== item.remainingQty);

        await api.post('/analyses', {
          type: item.type,
          order_id: selectedExecution.orderId || null,
          client_id: selectedExecution.clientId || null,
          farm_id: selectedExecution.farmId || null,
          plot_id: plotId,
          quantity: item.currentQty,
          status: "Pendente",
          date: getLocalDateISO(),
          results: {
            serviceName: selectedExecution.serviceName,
            clientName: selectedExecution.clientName,
            farmName: selectedExecution.farmName,
            plotName,
            quantity: item.currentQty,
            suggestedQuantity: item.suggestedQty,
            unitPrice: item.unitPrice,
            totalValue: item.currentQty * item.unitPrice,
            isModified: isCommercialDiff,
            isPartialImport: isPartialShipment,
            executionId: includeAnalysesExecId !== "all" ? includeAnalysesExecId : undefined,
            financialTag: item.isExtra
              ? "Análise Extra (Fora do Orçamento)"
              : isCommercialDiff
              ? "Quantidade Alterada (Comercial)"
              : isPartialShipment
              ? "Remessa Parcial"
              : "Conforme Orçamento",
          }
        });
      }

      const totalSent = itemsToSave.reduce((s, i) => s + i.currentQty, 0);
      toast({
        title: isPartialShipment
          ? "Remessa Parcial de Análises Importada!"
          : "Análises Cadastradas no Laboratório!",
        description: `${totalSent} amostras foram registradas na tela de Análises${plotName !== "Geral" ? ` (${plotName})` : ""}.`
      });

      setIsIncludeAnalysesModalOpen(false);
      fetchExecutions();
    } catch (err: any) {
      toast({ title: "Erro ao incluir análises", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Agenda de Serviços Agrícolas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o agendamento, progresso de execução por operador e fechamento financeiro
          </p>
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      <Card className="p-4 bg-muted/20 border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <Label className="text-xs font-semibold">Busca Geral</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente, fazenda, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs bg-background h-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Cliente</Label>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="mt-1 text-xs bg-background h-9">
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {uniqueClients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Fazenda</Label>
            <Select value={filterFarm} onValueChange={setFilterFarm}>
              <SelectTrigger className="mt-1 text-xs bg-background h-9">
                <SelectValue placeholder="Todas as fazendas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fazendas</SelectItem>
                {uniqueFarms.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Serviço</Label>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="mt-1 text-xs bg-background h-9">
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                {uniqueServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Responsável</Label>
            <Select value={filterResponsible} onValueChange={setFilterResponsible}>
              <SelectTrigger className="mt-1 text-xs bg-background h-9">
                <SelectValue placeholder="Todos os responsáveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os responsáveis</SelectItem>
                {uniqueResponsibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Operador</Label>
            <Select value={filterCollaborator} onValueChange={setFilterCollaborator}>
              <SelectTrigger className="mt-1 text-xs bg-background h-9">
                <SelectValue placeholder="Todos os operadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os operadores</SelectItem>
                {collaboratorsList.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Equipamento</Label>
            <Select value={filterEquipment} onValueChange={setFilterEquipment}>
              <SelectTrigger className="mt-1 text-xs bg-background h-9">
                <SelectValue placeholder="Todos os equipamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os equipamentos</SelectItem>
                {equipmentList.map(eq => <SelectItem key={eq.id} value={eq.name}>{eq.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Estado (UF)</Label>
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="mt-1 text-xs bg-background h-9">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {uniqueStates.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold block mb-1">Status</Label>
            <MultiStatusFilter
              placeholder="Status"
              options={[
                { value: "Pendente", label: "Pendente" },
                { value: "Agendado", label: "Agendado" },
                { value: "Em Andamento", label: "Em Andamento" },
                { value: "Concluído", label: "Concluído" },
                { value: "Cancelado", label: "Cancelado" },
              ]}
              selected={filterStatus}
              onChange={setFilterStatus}
              triggerClassName="w-full h-9 text-xs"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setFilterClient("all");
                setFilterFarm("all");
                setFilterService("all");
                setFilterResponsible("all");
                setFilterCollaborator("all");
                setFilterEquipment("all");
                setFilterState("all");
                setFilterCity("all");
                setFilterStatus([]);
              }}
              className="w-full text-xs h-9 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Visão Mobile em Cards */}
      <div className="space-y-3 md:hidden">
        {filteredExecutions.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground text-sm">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-slate-700">Nenhum agendamento encontrado</p>
              <p className="text-xs text-muted-foreground">Tente limpar os filtros ou selecionar outro status.</p>
            </div>
          </Card>
        ) : (
          filteredExecutions.map((execution) => {
            const totalArea = parseFloat(execution.area) || 0;
            const executedArea = (execution.partialExecutions || []).reduce(
              (sum, p) => sum + (parseFloat(p.executedArea) || 0),
              0
            );
            const percent = totalArea > 0 ? Math.min(100, Math.round((executedArea / totalArea) * 100)) : 0;
            const remainingArea = Math.max(0, totalArea - executedArea);
            const isCanceled = execution.status === "Cancelado";

            return (
              <Card key={execution.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{execution.clientName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {execution.farmName}
                      {execution.city && execution.city !== "-" ? ` • ${execution.city}/${execution.state || "PR"}` : ""}
                    </div>
                  </div>
                  <Badge
                    className={`text-xs whitespace-nowrap shrink-0 ${
                      execution.status === "Concluído"
                        ? "bg-green-100 text-green-800"
                        : execution.status === "Em Andamento"
                        ? "bg-blue-100 text-blue-800"
                        : isCanceled
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {execution.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{execution.serviceName}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {execution.scheduledDate ? new Date(execution.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR') : "Não definida"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-muted/30">
                  <span className="flex items-center gap-1 truncate">
                    👤 Responsável: <strong className="text-foreground font-medium">{execution.responsibleName || "Sistema"}</strong>
                  </span>
                  {execution.creatorName && execution.responsibleName && execution.creatorName.toLowerCase().trim() !== execution.responsibleName.toLowerCase().trim() && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                      Criado por {execution.creatorName}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{executedArea.toFixed(2)} / {totalArea.toFixed(2)} ha</span>
                    <span className="font-bold text-primary">{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-1.5" />
                  <div className="text-[10px] text-muted-foreground">
                    {remainingArea > 0 ? `Faltam ${remainingArea.toFixed(2)} ha` : "100% concluído"}
                  </div>
                </div>

                {(execution.collaborators.length > 0 || execution.equipmentNames.length > 0) && (
                  <div className="space-y-1.5 pt-2 border-t text-[11px]">
                    {execution.collaborators.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-muted-foreground mr-1">Equipe:</span>
                        {execution.collaborators.map((c, idx) => (
                          <Badge key={idx} variant="secondary" className="rounded-md text-[11px] font-normal py-0 px-1.5">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {execution.equipmentNames.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-muted-foreground mr-1">Equip.:</span>
                        {execution.equipmentNames.map((eq, idx) => (
                          <Badge key={idx} variant="outline" className="rounded-md text-[11px] font-normal py-0 px-1.5">
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2 border-t justify-end">
                  {(() => {
                    const sentCount = analysesCountByOrderId[execution.orderId || execution.id] || 0;
                    return (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-2 text-xs",
                          sentCount > 0
                            ? "text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 font-semibold border border-indigo-200"
                            : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        )}
                        onClick={() => openIncludeAnalysesModal(execution)}
                        title={sentCount > 0 ? `${sentCount} amostras já enviadas ao laboratório` : "Lançar / importar análises"}
                      >
                        <FlaskConical className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                        Análises{sentCount > 0 ? ` (${sentCount} enviadas)` : ""}
                      </Button>
                    );
                  })()}
                  {!isCanceled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-medium"
                      onClick={() => openExecutionModal(execution)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      Execução
                    </Button>
                  )}
                  {!isCanceled && execution.status !== "Concluído" && (
                    <Button
                      size="sm"
                      className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => openFinanceCompletionModal(execution)}
                    >
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Tabela Principal Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2.5 min-w-[175px]">Cliente / Fazenda</TableHead>
                  <TableHead className="px-2.5">Serviço</TableHead>
                  <TableHead className="px-2.5">Execução (ha)</TableHead>
                  <TableHead className="px-2.5">Data</TableHead>
                  <TableHead className="px-2.5">Equipe / Equip.</TableHead>
                  <TableHead className="px-2.5">Status</TableHead>
                  <TableHead className="px-2.5 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Calendar className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-slate-700">Nenhum agendamento encontrado</p>
                        <p className="text-xs text-muted-foreground">Tente limpar os filtros ou selecionar outro status.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExecutions.map((execution) => {
                    const totalArea = parseFloat(execution.area) || 0;
                    const executedArea = (execution.partialExecutions || []).reduce(
                      (sum, p) => sum + (parseFloat(p.executedArea) || 0),
                      0
                    );
                    const percent = totalArea > 0 ? Math.min(100, Math.round((executedArea / totalArea) * 100)) : 0;
                    const remainingArea = Math.max(0, totalArea - executedArea);
                    const isCanceled = execution.status === "Cancelado";

                    return (
                      <TableRow key={execution.id} className="hover:bg-muted/40">
                        <TableCell className="px-2.5 py-3 min-w-[175px]">
                          <div className="font-semibold text-foreground text-xs sm:text-sm leading-snug">{execution.clientName}</div>
                          <div className="text-xs text-muted-foreground leading-snug mt-0.5">{execution.farmName}</div>
                          {execution.city && execution.city !== "-" && (
                            <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                              {execution.city} / {execution.state || "PR"}
                            </div>
                          )}
                          {Array.isArray(execution.rawOrder?.plots) && execution.rawOrder.plots.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {execution.rawOrder.plots.map((plot: string, pIdx: number) => (
                                <Badge key={pIdx} variant="outline" className="text-[10px] py-0 px-1 text-emerald-700 bg-emerald-50/60 border-emerald-200">
                                  📍 {typeof plot === 'string' ? plot : ((plot as any)?.name || (plot as any)?.id || 'Talhão')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="px-2.5 py-3 font-medium text-xs max-w-[170px]">
                          <div className="font-semibold text-slate-800">{formatServiceName(execution.serviceName)}</div>
                          {(() => {
                            const rawOrder = execution.rawOrder;
                            const contractYears =
                              rawOrder?.contractYears ||
                              rawOrder?.contract_years ||
                              rawOrder?.serviceDetails?.contractYears ||
                              rawOrder?.service_details?.contractYears ||
                              (rawOrder?.serviceName?.match(/(\d+)\s*anos/i)?.[1]
                                ? parseInt(rawOrder.serviceName.match(/(\d+)\s*anos/i)![1], 10)
                                : null) ||
                              (Array.isArray(rawOrder?.payment_schedules) && rawOrder.payment_schedules.length > 0
                                ? Math.max(...rawOrder.payment_schedules.map((p: any) => p.cycleYear || 1), 1)
                                : 1);

                            const allSchedules = Array.isArray(rawOrder?.schedules) ? rawOrder.schedules : [];
                            const totalVisits = allSchedules.length;
                            const realizedVisits = allSchedules.filter((s: any) => s.status === 'Realizado').length;

                            const realizedSafrasFromVisits = new Set(
                              allSchedules
                                .filter((s: any) => s.status === 'Realizado' && s.yearCycle)
                                .map((s: any) => s.yearCycle)
                            ).size;

                            const realizedSafrasFromArea =
                              totalArea > 0 && contractYears > 1
                                ? Math.min(contractYears, Math.floor((executedArea / totalArea) * contractYears))
                                : (executedArea > 0 ? 1 : 0);

                            const executedSafras = Math.max(realizedSafrasFromVisits, realizedSafrasFromArea);

                            const allPaymentSchedules = Array.isArray(rawOrder?.payment_schedules)
                              ? rawOrder.payment_schedules
                              : (Array.isArray(rawOrder?.paymentSchedules) ? rawOrder.paymentSchedules : []);
                            const totalPayments = allPaymentSchedules.length;
                            const paidPayments = allPaymentSchedules.filter((s: any) => s.status === 'Pago').length;

                            return (
                              <div className="space-y-0.5 mt-1">
                                {/* Visitas Técnicas */}
                                {totalVisits > 0 && (
                                  <div
                                    className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1"
                                    title={`${realizedVisits} de ${totalVisits} visitas técnicas realizadas`}
                                  >
                                    <span>📅</span> {realizedVisits > 0 ? `${realizedVisits}/${totalVisits} visitas` : `${totalVisits} visitas`}
                                  </div>
                                )}

                                {/* Safras Executadas no Campo */}
                                {contractYears > 1 && (
                                  <div
                                    className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1"
                                    title={`${executedSafras} de ${contractYears} safras contratadas executadas no campo`}
                                  >
                                    <span>🌾</span> {executedSafras}/{contractYears} safras executadas
                                  </div>
                                )}

                                {/* Pagamentos / Parcelas Quitadas */}
                                {totalPayments > 0 && (
                                  <div
                                    className="text-[10px] text-amber-800 font-semibold flex items-center gap-1"
                                    title={`${paidPayments} de ${totalPayments} parcelas/pagamentos programados quitados`}
                                  >
                                    <span>💰</span> {paidPayments}/{totalPayments} pagamentos pagos
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>

                        {/* Coluna de Progresso em Hectares */}
                        <TableCell className="px-2.5 py-3">
                          <div className="space-y-1 min-w-[115px] max-w-[135px]">
                            <div className="flex justify-between text-[11px] font-medium gap-1">
                              <span className="whitespace-nowrap">{executedArea.toFixed(1)} / {totalArea.toFixed(1)} ha</span>
                              <span className="font-bold text-primary">{percent}%</span>
                            </div>
                            <Progress value={percent} className="h-1.5" />
                            <div className="text-[10px] text-muted-foreground">
                              {remainingArea > 0 ? `Faltam ${remainingArea.toFixed(1)} ha` : "100% concluído"}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-2.5 py-3 text-xs whitespace-nowrap">
                          {execution.scheduledDate ? (
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                              {new Date(execution.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Não definida</span>
                          )}
                        </TableCell>

                        {/* Equipe & Equipamentos combinados para dar fôlego à tabela */}
                        <TableCell className="px-2.5 py-3 max-w-[185px]">
                          {(!execution.collaborators || execution.collaborators.length === 0) &&
                          (!execution.equipmentNames || execution.equipmentNames.length === 0) ? (
                            <span className="text-xs text-muted-foreground italic">Não atribuído</span>
                          ) : (
                            <div className="space-y-1">
                              {execution.collaborators && execution.collaborators.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  {execution.collaborators.slice(0, 2).map((collab, idx) => (
                                    <Badge key={idx} variant="secondary" className="rounded-md text-[11px] font-normal py-0 px-1.5 whitespace-nowrap">
                                      {collab}
                                    </Badge>
                                  ))}
                                  {execution.collaborators.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="rounded-md text-[11px] font-semibold py-0 px-1.5 cursor-help bg-muted/60"
                                      title={execution.collaborators.slice(2).join(', ')}
                                    >
                                      +{execution.collaborators.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {execution.equipmentNames && execution.equipmentNames.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  {execution.equipmentNames.slice(0, 2).map((eq, idx) => (
                                    <Badge key={idx} variant="outline" className="rounded-md text-[10px] font-normal py-0 px-1.5 leading-snug max-w-[165px] truncate" title={eq}>
                                      {eq}
                                    </Badge>
                                  ))}
                                  {execution.equipmentNames.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="rounded-md text-[10px] font-semibold py-0 px-1.5 cursor-help bg-muted/60"
                                      title={execution.equipmentNames.slice(2).join(', ')}
                                    >
                                      +{execution.equipmentNames.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="px-2.5 py-3">
                          <Badge
                            className={`text-xs whitespace-nowrap ${
                              execution.status === "Concluído"
                                ? "bg-green-100 text-green-800"
                                : execution.status === "Em Andamento"
                                ? "bg-blue-100 text-blue-800"
                                : isCanceled
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {execution.status}
                          </Badge>
                        </TableCell>

                        {/* Ações da Agenda */}
                        <TableCell className="px-2.5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Incluir e Consultar Análises */}
                            {(() => {
                              const sentCount = analysesCountByOrderId[execution.orderId || execution.id] || 0;
                              return (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "h-7 px-2 text-xs border-indigo-200",
                                    sentCount > 0
                                      ? "text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 font-semibold border-indigo-300"
                                      : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                  )}
                                  onClick={() => openIncludeAnalysesModal(execution)}
                                  title={sentCount > 0 ? `${sentCount} amostras já enviadas ao laboratório (clique para ver histórico ou lançar)` : "Incluir análises recomendadas da planilha"}
                                  aria-label="Análises"
                                >
                                  <FlaskConical className="h-3.5 w-3.5 2xl:mr-1" />
                                  <span className="hidden 2xl:inline">
                                    Análises{sentCount > 0 ? ` (${sentCount})` : ""}
                                  </span>
                                </Button>
                              );
                            })()}

                            {/* Registrar Execução em Campo */}
                            {!isCanceled && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs font-medium"
                                onClick={() => openExecutionModal(execution)}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                Execução
                              </Button>
                            )}

                            {/* Concluir e Enviar para Financeiro */}
                            {!isCanceled && execution.status !== "Concluído" && (
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => openFinanceCompletionModal(execution)}
                                title="Concluir serviço e enviar ao financeiro"
                              >
                                <DollarSign className="h-3.5 w-3.5 mr-1" />
                                Concluir
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: REGISTRO DE EXECUÇÃO COM RATEIO POR OPERADOR/MÁQUINA */}
      <Dialog open={isExecutionModalOpen} onOpenChange={setIsExecutionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Apontamento de Campo — {selectedExecution?.clientName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Registro de área executada em campo e rateio por operador e equipamento
            </DialogDescription>
          </DialogHeader>

          {selectedExecution && (() => {
            const totalArea = parseFloat(selectedExecution.area || "0");
            const alreadyDone = selectedExecution.partialExecutions.reduce(
              (sum, p) => sum + (parseFloat(p.executedArea) || 0),
              0
            );
            const remaining = Math.max(0, totalArea - alreadyDone);

            return (
              <form onSubmit={handleAddPartialExecution} className="space-y-4">
                {/* Cards com Balanço da Área */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Área Contratada</div>
                    <div className="text-base font-bold text-foreground">{totalArea.toFixed(2)} ha</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Já Executado</div>
                    <div className="text-base font-bold text-emerald-600">{alreadyDone.toFixed(2)} ha</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Saldo Restante</div>
                    <div className="text-base font-bold text-amber-600">{remaining.toFixed(2)} ha</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exec-date" className="text-xs font-semibold">Data da Operação</Label>
                    <Input
                      id="exec-date"
                      type="date"
                      value={partialExecutionForm.date}
                      onChange={(e) => setPartialExecutionForm({ ...partialExecutionForm, date: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="exec-area" className="text-xs font-semibold">Área Executada Neste Apontamento (ha)</Label>
                      {remaining > 0 && (
                        <button
                          type="button"
                          onClick={() => setPartialExecutionForm(prev => ({ ...prev, executedArea: remaining.toFixed(2) }))}
                          className="text-[11px] text-primary hover:underline font-medium"
                        >
                          Usar saldo restante ({remaining.toFixed(2)} ha)
                        </button>
                      )}
                    </div>
                    <DecimalInput
                      id="exec-area"
                      value={partialExecutionForm.executedArea}
                      onValueChange={(_, normalized) => setPartialExecutionForm({ ...partialExecutionForm, executedArea: normalized })}
                      placeholder="0,00"
                      required
                      className="mt-1 text-base font-semibold"
                    />
                  </div>
                </div>

                {/* RATEIO POR OPERADOR E EQUIPAMENTO */}
                <div className="p-3 border rounded-md bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Rateio por Operador e Equipamento (Quem executou o quê?)
                    </Label>
                    <span className="text-[11px] text-muted-foreground">Opcional, porém recomendado para relatórios</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
                    <div>
                      <Label className="text-[11px]">Operador</Label>
                      <Select value={splitOperator} onValueChange={setSplitOperator}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {collaboratorsList.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px]">Equipamento / Máquina</Label>
                      <Select value={splitEquipment} onValueChange={setSplitEquipment}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentList.map(eq => <SelectItem key={eq.id} value={eq.name}>{eq.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {isSelectedApplicationService && (
                      <>
                        <div>
                          <Label className="text-[11px]">Produto Aplicado</Label>
                          {availableExecutionProducts.length > 0 ? (
                            <Select value={splitProduct} onValueChange={setSplitProduct}>
                              <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue placeholder="Selecione o produto do pedido..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableExecutionProducts.map((p, i) => (
                                  <SelectItem key={i} value={p}>{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Ex: Calcário, Gesso..."
                              value={splitProduct}
                              onChange={(e) => setSplitProduct(e.target.value)}
                              className="h-8 text-xs bg-background"
                            />
                          )}
                        </div>

                        <div>
                          <Label className="text-[11px]">Qtd Aplicada</Label>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              step="any"
                              placeholder="Ex: 18"
                              value={splitQuantity}
                              onChange={(e) => setSplitQuantity(e.target.value)}
                              className="h-8 text-xs bg-background"
                            />
                            <Select value={splitUnit} onValueChange={setSplitUnit}>
                              <SelectTrigger className="h-8 text-xs w-16 bg-background shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ton">Ton</SelectItem>
                                <SelectItem value="Kg">Kg</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="sc">sc</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label className="text-[11px]">Talhão</Label>
                      <Select value={splitPlot} onValueChange={setSplitPlot}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Selecione o talhão..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableExecutionPlots.map((p) => (
                            <SelectItem key={p.id} value={p.name}>
                              {p.name}{p.area ? ` (${p.area} ha)` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-1.5">
                      <div className="flex-1">
                        <Label className="text-[11px]">Área (ha)</Label>
                        <DecimalInput
                          placeholder="Ex: 20"
                          value={splitArea}
                          onValueChange={(_, normalized) => setSplitArea(normalized)}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddSplit}
                        className="h-8 text-xs mt-auto bg-primary shrink-0"
                      >
                        + Adicionar
                      </Button>
                    </div>
                  </div>

                  {executionSplits.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t">
                      <div className="text-[11px] font-semibold text-muted-foreground">Linhas de Rateio Adicionadas:</div>
                      {executionSplits.map((sp) => (
                        <div key={sp.id} className="flex items-center justify-between p-2 bg-background border rounded text-xs">
                          <div>
                            <strong>{sp.collaboratorName}</strong> ({sp.equipmentName}):{" "}
                            {sp.quantity ? `${sp.quantity} ${sp.unit} de ` : ''}
                            <strong>{sp.productName || 'Aplicação'}</strong>
                            {sp.plotName ? ` • ${sp.plotName}` : ''} em{" "}
                            <span className="font-semibold text-emerald-600">{sp.areaHa.toFixed(2)} ha</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSplit(sp.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="exec-notes" className="text-xs font-semibold">Observações de Campo</Label>
                  <Input
                    id="exec-notes"
                    placeholder="Ex: Condições do solo, clima, umidade..."
                    value={partialExecutionForm.notes}
                    onChange={(e) => setPartialExecutionForm({ ...partialExecutionForm, notes: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <DialogFooter className="pt-3 border-t flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="text-xs text-muted-foreground w-full sm:w-auto text-left">
                    {parseFloat(partialExecutionForm.executedArea || "0") < remaining ? (
                      <span className="text-amber-700 font-medium">
                        ⚠️ Apontamento Parcial: restarão {(remaining - (parseFloat(partialExecutionForm.executedArea || "0") || 0)).toFixed(2)} ha
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">
                        ✓ Este apontamento cobrirá 100% do saldo restante
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsExecutionModalOpen(false)}>
                      Cancelar
                    </Button>
                    {remaining > 0 && parseFloat(partialExecutionForm.executedArea || "0") < remaining && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          setPartialExecutionForm(prev => ({ ...prev, executedArea: remaining.toFixed(2) }));
                          setTimeout(() => {
                            const submitBtn = document.getElementById("btn-submit-exec");
                            if (submitBtn) submitBtn.click();
                          }, 50);
                        }}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      >
                        Salvar Total ({remaining.toFixed(2)} ha)
                      </Button>
                    )}
                    <Button id="btn-submit-exec" type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                      {parseFloat(partialExecutionForm.executedArea || "0") < remaining ? "Salvar Execução Parcial" : "Salvar Execução Total"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CONCLUSÃO FINANCEIRA (TOTAL OU PARCIAL COM AJUSTE DE VALOR) */}
      <Dialog open={isFinanceCompletionModalOpen} onOpenChange={setIsFinanceCompletionModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Concluir Serviço e Faturar
            </DialogTitle>
            <DialogDescription className="sr-only">
              Fechamento do valor final e envio do pedido ao financeiro
            </DialogDescription>
          </DialogHeader>

          {selectedExecution && (
            <div className="space-y-3 pt-1">
              <div className="p-2.5 bg-muted/40 rounded-lg border text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span>Cliente: <strong>{selectedExecution.clientName}</strong></span>
                  <Badge variant="outline" className="text-[10px]">{selectedExecution.serviceName}</Badge>
                </div>
                <div className="text-muted-foreground">Fazenda: <strong>{selectedExecution.farmName}</strong></div>
                <div className="pt-1.5 border-t flex justify-between items-center">
                  <span>Execução Física Concluída:</span>
                  <Badge
                    variant={financeCompletionForm.isPartial ? "secondary" : "default"}
                    className={cn(
                      "text-[10px]",
                      financeCompletionForm.isSurplusArea && "bg-purple-100 text-purple-900 border-purple-300 font-bold",
                      financeCompletionForm.isPartial && "bg-amber-100 text-amber-900 border-amber-300"
                    )}
                  >
                    {financeCompletionForm.executedPercentage}% ({
                      financeCompletionForm.isSurplusArea
                        ? `Excedente +${financeCompletionForm.surplusAreaHa.toFixed(2)} ha`
                        : financeCompletionForm.isPartial
                        ? "Parcial"
                        : "Total 100%"
                    })
                  </Badge>
                </div>
                {financeCompletionForm.contractedSamples > 0 && (
                  <div className="pt-1 border-t flex justify-between items-center">
                    <span className="text-muted-foreground">Amostras de Laboratório:</span>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-semibold",
                      financeCompletionForm.hasSurplusSamples
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : "bg-muted/50 text-foreground"
                    )}>
                      {financeCompletionForm.actualSentSamples} enviadas / {financeCompletionForm.contractedSamples} previstas
                      {financeCompletionForm.surplusSamplesQty > 0 && ` (+${financeCompletionForm.surplusSamplesQty} excedentes)`}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Destaque e Alerta para Área Excedente Executada */}
              {financeCompletionForm.isSurplusArea && (
                <div className="p-2.5 rounded-lg border border-purple-300 bg-purple-50/70 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <TrendingUp className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>Área Excedente Executada (+{financeCompletionForm.surplusAreaHa.toFixed(2)} ha)</span>
                  </div>
                  <p className="text-purple-800 text-[11px] leading-relaxed">
                    Foram executados <strong>{selectedExecution.partialExecutions.reduce((s, p) => s + (parseFloat(p.executedArea) || 0), 0).toFixed(2)} ha</strong> no campo ({selectedExecution.area} ha contratados).
                    Acréscimo proporcional de área calculado em <strong>+R$ {financeCompletionForm.surplusAreaValue.toFixed(2)}</strong> ({financeCompletionForm.pricePerHa > 0 ? `R$ ${financeCompletionForm.pricePerHa.toFixed(2)}/ha` : ''}).
                  </p>
                </div>
              )}

              {/* Destaque e Alerta para Amostras Excedentes */}
              {financeCompletionForm.hasSurplusSamples && (
                <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/70 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <FlaskConical className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Amostras Excedentes Detectadas (+{financeCompletionForm.surplusSamplesQty} análises)</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Foram enviadas <strong>{financeCompletionForm.actualSentSamples}</strong> amostras ao laboratório ({financeCompletionForm.contractedSamples} previstas).
                    O acréscimo foi calculado <strong>exclusivamente pelo valor de cada análise excedente de laboratório</strong>.
                  </p>
                  {financeCompletionForm.surplusDetails && (
                    <div className="text-[10px] text-amber-950 font-medium bg-amber-100/70 p-1.5 rounded border border-amber-200">
                      Cálculo por análise: <strong>{financeCompletionForm.surplusDetails}</strong>
                    </div>
                  )}
                  {financeCompletionForm.surplusEstimatedValue > 0 && (
                    <div className="pt-1 flex items-center justify-between border-t border-amber-200/60 flex-wrap gap-1">
                      <span className="text-emerald-800 font-semibold text-[11px]">
                        Acréscimo das análises: +R$ {financeCompletionForm.surplusEstimatedValue.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Botões Rápidos de Aplicação quando houver acréscimo de Área ou Análises */}
              {(financeCompletionForm.isSurplusArea || financeCompletionForm.hasSurplusSamples) && (
                <div className="p-2 rounded-lg bg-muted/30 border flex items-center justify-between flex-wrap gap-1.5 text-xs">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Ajuste sugerido: <strong className="text-emerald-700">R$ {financeCompletionForm.suggestedValue.toFixed(2)}</strong>
                    {financeCompletionForm.isSurplusArea && financeCompletionForm.hasSurplusSamples
                      ? ` (Área +R$ ${financeCompletionForm.surplusAreaValue.toFixed(2)} | Lab +R$ ${financeCompletionForm.surplusEstimatedValue.toFixed(2)})`
                      : financeCompletionForm.isSurplusArea
                      ? ` (Área +R$ ${financeCompletionForm.surplusAreaValue.toFixed(2)})`
                      : ` (Lab +R$ ${financeCompletionForm.surplusEstimatedValue.toFixed(2)})`}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold"
                      onClick={() => setFinanceCompletionForm((prev) => ({
                        ...prev,
                        finalValue: prev.suggestedValue.toFixed(2)
                      }))}
                      title="Aplicar valor sugerido com acréscimo"
                    >
                      Aplicar R$ {financeCompletionForm.suggestedValue.toFixed(2)}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-muted-foreground hover:bg-muted font-medium"
                      onClick={() => setFinanceCompletionForm((prev) => ({
                        ...prev,
                        finalValue: prev.originalValue.toFixed(2)
                      }))}
                      title="Manter apenas o valor original contratado"
                    >
                      Manter Original R$ {financeCompletionForm.originalValue.toFixed(2)}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold">Valor Original Contratado</Label>
                <Input
                  value={`R$ ${financeCompletionForm.originalValue.toFixed(2)}`}
                  readOnly
                  className="bg-muted mt-1 h-8 text-xs font-medium"
                />
              </div>

              <div>
                <Label htmlFor="final-billing-value" className="text-xs font-semibold flex items-center justify-between">
                  <span>Valor Final a Faturar (R$)</span>
                  {financeCompletionForm.isSurplusArea || financeCompletionForm.hasSurplusSamples ? (
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Com acréscimo {financeCompletionForm.isSurplusArea && financeCompletionForm.hasSurplusSamples ? '(área + análises)' : financeCompletionForm.isSurplusArea ? '(área excedente)' : '(análises)'} sugerido
                    </span>
                  ) : financeCompletionForm.isPartial ? (
                    <span className="text-[10px] text-amber-600">Sugerido proporcional ao executado</span>
                  ) : null}
                </Label>
                <Input
                  id="final-billing-value"
                  type="number"
                  step="0.01"
                  value={financeCompletionForm.finalValue}
                  onChange={(e) => setFinanceCompletionForm({ ...financeCompletionForm, finalValue: e.target.value })}
                  className="mt-1 h-9 text-base font-bold text-emerald-600"
                />
              </div>

              <div>
                <Label htmlFor="adjustment-note" className="text-xs font-semibold flex items-center justify-between">
                  <span>
                    Justificativa / Nota de Fechamento {(financeCompletionForm.isPartial || financeCompletionForm.hasSurplusSamples) && <span className="text-red-500">*</span>}
                  </span>
                  {financeCompletionForm.hasSurplusSamples && (
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      Nota automática gerada
                    </span>
                  )}
                </Label>
                <Textarea
                  id="adjustment-note"
                  rows={2}
                  placeholder="Ex: Conclusão parcial autorizada pelo cliente..."
                  value={financeCompletionForm.adjustmentNote}
                  onChange={(e) => setFinanceCompletionForm({ ...financeCompletionForm, adjustmentNote: e.target.value })}
                  className="mt-1 text-xs resize-none"
                />
              </div>

              <DialogFooter className="pt-2 border-t flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsFinanceCompletionModalOpen(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleConfirmFinanceCompletion} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Enviar para Financeiro
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: INCLUIR ANÁLISES RECOMENDADAS DA PLANILHA (COM SUPORTE A SERVIÇO PARCIAL) */}
      <Dialog open={isIncludeAnalysesModalOpen} onOpenChange={setIsIncludeAnalysesModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-600" />
              Importar Análises do Serviço
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirmar e lançar análises laboratoriais recomendadas para o pedido, com suporte a envio parcial por etapa e talhão
            </DialogDescription>
          </DialogHeader>

          {selectedExecution && (() => {
            const rawExecs: any[] = Array.isArray(selectedExecution.rawOrder?.executions)
              ? selectedExecution.rawOrder.executions
              : [];
            const rawPlots: any[] = Array.isArray(selectedExecution.rawOrder?.plots)
              ? selectedExecution.rawOrder.plots
              : [];
            const totalContracted = recommendedAnalysesList.reduce((s, i) => s + i.suggestedQty, 0);
            const totalAlreadyImported = recommendedAnalysesList.reduce((s, i) => s + i.alreadyImportedQty, 0);
            const totalRemaining = recommendedAnalysesList.reduce((s, i) => s + i.remainingQty, 0);
            const totalSendingNow = recommendedAnalysesList.reduce((s, i) => s + i.currentQty, 0);

            return (
              <div className="space-y-4">
                <div className="p-2.5 rounded-md border bg-muted/30 text-xs space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span>
                      Serviço: <strong>{selectedExecution.serviceName}</strong> ({selectedExecution.area} ha)
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedExecution.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Contratado: <strong>{totalContracted}</strong> • Já importado: <strong>{totalAlreadyImported}</strong>
                    </span>
                    <span className="font-semibold text-indigo-700">
                      Saldo restante: {totalRemaining} amostras
                    </span>
                  </div>
                </div>

                <Tabs value={analysesModalTab} onValueChange={setAnalysesModalTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full mb-3">
                    <TabsTrigger value="new" className="text-xs">
                      Lançar / Enviar Amostras
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs flex items-center gap-1.5">
                      <span>Histórico de Envios</span>
                      {totalAlreadyImported > 0 && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-indigo-100 text-indigo-800">
                          {totalAlreadyImported}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="new" className="space-y-4 mt-0">
                    {/* Controle de Importação Parcial (Etapa + Talhão) */}
                    <div className="p-3 rounded-md border bg-indigo-50/40 border-indigo-200/80 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-indigo-950 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeAnalysesPartialMode}
                            onChange={(e) => setIncludeAnalysesPartialMode(e.target.checked)}
                            className="rounded border-indigo-400"
                          />
                          Importação Parcial (enviar parte das amostras agora e manter saldo)
                        </label>
                        {includeAnalysesPartialMode && (
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 text-[10px]">
                            Modo Parcial
                          </Badge>
                        )}
                      </div>

                      {(rawExecs.length > 0 || rawPlots.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rawExecs.length > 0 && (
                            <div>
                              <Label className="text-[11px] text-indigo-950">Etapa de Execução:</Label>
                              <Select
                                value={includeAnalysesExecId}
                                onValueChange={handleSelectPartialStageForAnalyses}
                              >
                                <SelectTrigger className="h-8 text-xs bg-background mt-0.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Saldo Geral do Pedido</SelectItem>
                                  {rawExecs.map((ex: any, eIdx: number) => {
                                    const alreadySent = includeAnalysesAlreadyImportedExecIds.includes(ex.id);
                                    const plotNames =
                                      Array.isArray(ex.plotExecutions) && ex.plotExecutions.length > 0
                                        ? ` • ${ex.plotExecutions.map((pe: any) => pe.plotName).join(", ")}`
                                        : "";
                                    return (
                                      <SelectItem key={ex.id || eIdx} value={ex.id || String(eIdx)}>
                                        Etapa {eIdx + 1} ({ex.date}) • {ex.areaExecuted || ex.hectares} ha
                                        {ex.samplesExecuted ? ` • ${ex.samplesExecuted} pts` : ""}
                                        {plotNames}
                                        {alreadySent ? " [Já importada]" : ""}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {rawPlots.length > 0 && (
                            <div>
                              <Label className="text-[11px] text-indigo-950">Talhão da Remessa:</Label>
                              <Select
                                value={includeAnalysesPlotId}
                                onValueChange={setIncludeAnalysesPlotId}
                              >
                                <SelectTrigger className="h-8 text-xs bg-background mt-0.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="geral">Todos / Geral da Fazenda</SelectItem>
                                  {rawPlots.map((p: any, pIdx: number) => {
                                    const pid = p.id || p.name || String(pIdx);
                                    const pname = typeof p === "string" ? p : p.name;
                                    return (
                                      <SelectItem key={pid} value={pid}>
                                        {pname}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {loadingIncludeAnalyses ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        Verificando remessas anteriores do pedido...
                      </div>
                    ) : (
                      <div className="space-y-2 border rounded-md p-2 bg-muted/20">
                        {recommendedAnalysesList.map((item, idx) => {
                          const exceedsContracted = item.alreadyImportedQty + item.currentQty > item.suggestedQty;
                          const showPartialBadge =
                            includeAnalysesPartialMode &&
                            item.currentQty > 0 &&
                            item.currentQty < item.remainingQty;
                          const showWarningBadge =
                            exceedsContracted || (!includeAnalysesPartialMode && item.currentQty !== item.remainingQty);

                          return (
                            <div key={`${item.type}-${idx}`} className="flex items-center justify-between p-2.5 bg-background border rounded gap-2">
                              <div className="min-w-0">
                                <div className="font-semibold text-xs text-foreground flex items-center gap-1.5 flex-wrap">
                                  <span>{item.type}</span>
                                  {item.description && (
                                    <span className="text-[10px] font-normal text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded border">
                                      {item.description}
                                    </span>
                                  )}
                                  {item.isExtra && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1 bg-purple-50 text-purple-800 border-purple-300">
                                      Extra / Avulsa
                                    </Badge>
                                  )}
                                  {!item.isExtra && showPartialBadge && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1 bg-indigo-50 text-indigo-800 border-indigo-300">
                                      Parcial (resta {item.remainingQty - item.currentQty})
                                    </Badge>
                                  )}
                                  {!item.isExtra && showWarningBadge && (
                                    <Badge variant="destructive" className="text-[10px] py-0 px-1">
                                      {exceedsContracted ? "Acima do Contratado" : "Qtd Alterada"}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  {item.isExtra ? (
                                    <>Não estava no pedido original{item.unitPrice > 0 ? ` • Tabela: R$ ${item.unitPrice.toFixed(2)}/un` : ""}</>
                                  ) : (
                                    <>
                                      Contratado: <strong>{item.suggestedQty}</strong>
                                      {item.alreadyImportedQty > 0 && (
                                        <> • Já importado: <strong>{item.alreadyImportedQty}</strong> • Saldo: <strong>{item.remainingQty}</strong></>
                                      )}{" "}
                                      (R$ {item.unitPrice.toFixed(2)}/un)
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Label className="text-xs">Qtd:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.currentQty}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                    setRecommendedAnalysesList(prev => {
                                      const updated = [...prev];
                                      updated[idx] = {
                                        ...updated[idx],
                                        currentQty: val,
                                        isModified: val !== item.remainingQty
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="w-20 text-center font-bold text-xs h-8"
                                />
                                {item.isExtra && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveExtraAnalysis(idx)}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    title="Remover análise extra"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Barra para incluir outro tipo de análise que não estava no pedido */}
                        <div className="pt-2 mt-2 border-t border-dashed space-y-2">
                          <Label className="text-[11px] font-semibold text-muted-foreground block">
                            + Incluir outra análise (fora do orçamento original):
                          </Label>
                          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                            <Select value={extraAnalysisType} onValueChange={setExtraAnalysisType}>
                              <SelectTrigger className="h-8 text-xs bg-background flex-1 min-w-[180px]">
                                <SelectValue placeholder="Selecione outro tipo de análise..." />
                              </SelectTrigger>
                              <SelectContent>
                                {EXTRA_ANALYSIS_CATALOG.filter(
                                  (c) => !recommendedAnalysesList.some((r) => r.type.toUpperCase() === c.type.toUpperCase())
                                ).map((c) => (
                                  <SelectItem key={c.type} value={c.type}>
                                    {c.type} — {c.description}
                                  </SelectItem>
                                ))}
                                <SelectItem value="__CUSTOM__">Outro tipo (digitar nome)...</SelectItem>
                              </SelectContent>
                            </Select>

                            {extraAnalysisType === "__CUSTOM__" && (
                              <Input
                                placeholder="Nome da análise..."
                                value={extraAnalysisCustomName}
                                onChange={(e) => setExtraAnalysisCustomName(e.target.value)}
                                className="h-8 text-xs bg-background flex-1 min-w-[140px]"
                              />
                            )}

                            <Input
                              type="number"
                              min="1"
                              value={extraAnalysisQty}
                              onChange={(e) => setExtraAnalysisQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-16 h-8 text-center text-xs bg-background"
                              title="Quantidade de amostras"
                            />

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleAddExtraAnalysis}
                              disabled={
                                !extraAnalysisType ||
                                (extraAnalysisType === "__CUSTOM__" && !extraAnalysisCustomName.trim())
                              }
                              className="h-8 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50 shrink-0"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Incluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      {includeAnalysesPartialMode
                        ? "No modo parcial, o saldo restante ficará disponível para as próximas remessas sem gerar alerta comercial."
                        : "Caso as quantidades ultrapassem o contratado ou sejam alteradas no envio total, uma etiqueta de alerta será enviada ao financeiro e laboratório."}
                    </div>

                    <DialogFooter className="pt-2 border-t flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsIncludeAnalysesModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConfirmIncludeAnalyses}
                        disabled={totalSendingNow <= 0 || loadingIncludeAnalyses}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {includeAnalysesPartialMode
                          ? `Importar Parcial (${totalSendingNow} amostras)`
                          : `Confirmar e Cadastrar (${totalSendingNow} amostras)`}
                      </Button>
                    </DialogFooter>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-3 mt-0">
                    {orderExistingAnalysesList.length === 0 ? (
                      <div className="p-8 text-center border rounded-md bg-muted/20 space-y-2">
                        <FlaskConical className="h-8 w-8 mx-auto text-muted-foreground/60" />
                        <div className="text-sm font-semibold text-foreground">Nenhuma análise enviada ainda</div>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          As remessas já enviadas para o laboratório aparecerão detalhadas aqui. Utilize a aba "Lançar / Enviar Amostras" para cadastrar o primeiro lote.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                          <span>Remessas registradas: <strong>{orderExistingAnalysesList.length}</strong></span>
                          <span>Total enviado ao lab: <strong className="text-indigo-700 font-bold">{totalAlreadyImported} amostras</strong></span>
                        </div>

                        <div className="border rounded-md overflow-x-auto max-h-[350px] overflow-y-auto w-full">
                          <Table className="text-xs w-full min-w-[500px]">
                            <TableHeader className="bg-muted/40 sticky top-0">
                              <TableRow>
                                <TableHead className="py-2">Data</TableHead>
                                <TableHead className="py-2">Tipo / Exame</TableHead>
                                <TableHead className="py-2 text-center">Qtd</TableHead>
                                <TableHead className="py-2">Talhão</TableHead>
                                <TableHead className="py-2">Status Lab</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderExistingAnalysesList.map((a: any, idx: number) => {
                                const qty = Number(a.results?.quantity ?? a.quantity ?? 1) || 1;
                                const plot = a.results?.plotName || (a.plot_id ? `Talhão ${a.plot_id}` : 'Geral');
                                const statusColor =
                                  a.status === 'Finalizado'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : a.status === 'Executando' || a.status === 'Recebido'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200';

                                const dateStr = a.date ? String(a.date).split('T')[0].split('-').reverse().join('/') : '-';

                                return (
                                  <TableRow key={a.id || idx}>
                                    <TableCell className="py-2 text-muted-foreground whitespace-nowrap">
                                      {dateStr}
                                    </TableCell>
                                    <TableCell className="py-2 font-medium">
                                      <div>{a.type}</div>
                                      {a.results?.financialTag && (
                                        <span className="text-[10px] text-muted-foreground">
                                          {a.results.financialTag}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-2 text-center">
                                      <Badge variant="outline" className="font-bold text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                        {qty}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-2 text-muted-foreground">
                                      {plot}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <span className={cn("inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap", statusColor)}>
                                        {a.status || 'Pendente'}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        <DialogFooter className="pt-2 border-t flex justify-between items-center sm:justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            Para laudos e laudos técnicos completos, acesse o menu <strong>Análises</strong>.
                          </span>
                          <Button variant="outline" onClick={() => setIsIncludeAnalysesModalOpen(false)}>
                            Fechar
                          </Button>
                        </DialogFooter>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;

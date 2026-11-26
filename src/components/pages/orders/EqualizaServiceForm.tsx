import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  EqualizaService,
  EqualizaCalculationResult,
  EqualizaPaymentPlanMode,
  EqualizaPaymentItem,
  EqualizaExecutionScheduleItem,
} from '../../../services/EqualizaService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2,
  Sparkles,
  Calendar,
  MapPin,
  DollarSign,
  Layers,
  RotateCcw,
  Plus,
  Trash2,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { generateUUID } from '@/lib/utils';

const EXECUTION_STAGE_OPTIONS = [
  'Amostragem de Solo em Grid (AP)',
  'Conferência de Solo',
  'Compactação de Solo',
  'Coleta Foliar (Safra)',
  'Análise de Fungo / Nematoide',
  'Voo de Drone (Mapeamento)',
  'Reunião de Devolutiva / Apresentação de Mapas',
  'Visita Técnica de Acompanhamento',
];

interface EqualizaServiceFormProps {
  initialAlqueires: number;
  availablePlots?: Array<{ id: string; name: string; area?: string | number }>;
  initialSchedules?: EqualizaExecutionScheduleItem[];
  initialPaymentSchedules?: EqualizaPaymentItem[];
  initialServiceDetails?: any;
  onValuesChange: (calculatedValue: number) => void;
  onAreaChange?: (areaHa: number) => void;
  onProductsChange?: (products: any[]) => void;
  onServiceDetailsChange?: (details: any) => void;
}

export const EqualizaServiceForm: React.FC<EqualizaServiceFormProps> = ({
  initialAlqueires,
  availablePlots = [],
  initialSchedules,
  initialPaymentSchedules,
  initialServiceDetails,
  onValuesChange,
  onAreaChange,
  onProductsChange,
  onServiceDetailsChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [totalAlqueires, setTotalAlqueires] = useState<number | null>(
    initialServiceDetails?.totalAlqueires
      ? Number(initialServiceDetails.totalAlqueires)
      : initialAlqueires === 0
      ? null
      : initialAlqueires
  );
  const [anosCiclo, setAnosCiclo] = useState<string>(
    String(initialServiceDetails?.contractYears || initialServiceDetails?.anosCiclo || '3')
  );
  const currentCalYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const defaultStartYear = currentMonth > 8 ? currentCalYear + 1 : currentCalYear;
  const [startYear, setStartYear] = useState<number>(
    Number(initialServiceDetails?.startYear) || defaultStartYear
  );
  const [paymentPlanMode, setPaymentPlanMode] = useState<EqualizaPaymentPlanMode>(
    (initialServiceDetails?.paymentPlanMode as EqualizaPaymentPlanMode) || 'semestral'
  );

  const [incluirFolha, setIncluirFolha] = useState<boolean>(Boolean(initialServiceDetails?.incluirFolha));
  const [incluirFungoNema, setIncluirFungoNema] = useState<boolean>(Boolean(initialServiceDetails?.incluirFungoNema));
  const [incluirCompactacao, setIncluirCompactacao] = useState<boolean>(
    Boolean(initialServiceDetails?.incluirCompactacao)
  );
  const [descontoManual, setDescontoManual] = useState<number | null>(
    initialServiceDetails?.descontoManual ? Number(initialServiceDetails.descontoManual) : null
  );

  // Alocação dos talhões por ano do contrato: { [ano: number]: string[] }
  const [yearAllocations, setYearAllocations] = useState<Record<number, string[]>>(
    initialServiceDetails?.yearAllocations || {}
  );

  // Agenda de Pagamento editável
  const [paymentItems, setPaymentItems] = useState<EqualizaPaymentItem[]>(
    Array.isArray(initialPaymentSchedules) && initialPaymentSchedules.length > 0 ? initialPaymentSchedules : []
  );
  const [isPaymentCustomized, setIsPaymentCustomized] = useState<boolean>(
    Boolean(Array.isArray(initialPaymentSchedules) && initialPaymentSchedules.length > 0)
  );

  // Agenda de Execução de Campo editável
  const [executionItems, setExecutionItems] = useState<EqualizaExecutionScheduleItem[]>(
    Array.isArray(initialSchedules) && initialSchedules.length > 0 ? initialSchedules : []
  );
  const [isExecutionCustomized, setIsExecutionCustomized] = useState<boolean>(
    Boolean(Array.isArray(initialSchedules) && initialSchedules.length > 0)
  );
  const [showExecutionSection, setShowExecutionSection] = useState<boolean>(true);
  const [executionFilterYear, setExecutionFilterYear] = useState<string>('all');

  const [calculationResult, setCalculationResult] = useState<EqualizaCalculationResult | null>(null);
  const didSyncInitialAlq = useRef(false);

  const equalizaService = useMemo(() => {
    if (costVariables.length > 0) {
      return new EqualizaService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    if (!didSyncInitialAlq.current && initialServiceDetails?.totalAlqueires) {
      didSyncInitialAlq.current = true;
      return;
    }
    setTotalAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
  }, [initialAlqueires, initialServiceDetails?.totalAlqueires]);

  const numAnos = Math.max(1, parseInt(anosCiclo, 10) || 3);

  // Normalizar lista de talhões deduplicada
  const normalizedPlots = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ id: string; name: string; areaAlq: number; areaHa: number }> = [];

    availablePlots.forEach((p, idx) => {
      const name = typeof p === 'string' ? p.trim() : (p?.name || p?.id || `Talhão ${idx + 1}`).trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        const areaHa = typeof p === 'object' && p?.area ? parseFloat(String(p.area)) || 0 : 0;
        const areaAlq = areaHa > 0 ? areaHa / 2.42 : 0;
        list.push({
          id: typeof p === 'object' && p?.id ? p.id : `plot-${idx}`,
          name,
          areaHa,
          areaAlq,
        });
      }
    });

    return list;
  }, [availablePlots]);

  // Função para auto-distribuir os talhões equilibradamente pelos anos do contrato
  const handleAutoDistributePlots = useCallback(() => {
    if (normalizedPlots.length === 0) return;

    const newAlloc: Record<number, string[]> = {};
    for (let yr = 1; yr <= numAnos; yr++) {
      newAlloc[yr] = [];
    }

    const hasAreas = normalizedPlots.some((p) => p.areaAlq > 0);

    if (hasAreas) {
      const sorted = [...normalizedPlots].sort((a, b) => b.areaAlq - a.areaAlq);
      const yearSums: Record<number, number> = {};
      for (let yr = 1; yr <= numAnos; yr++) yearSums[yr] = 0;

      sorted.forEach((plot) => {
        let minYear = 1;
        let minVal = yearSums[1];
        for (let yr = 2; yr <= numAnos; yr++) {
          if (yearSums[yr] < minVal) {
            minVal = yearSums[yr];
            minYear = yr;
          }
        }
        newAlloc[minYear].push(plot.name);
        yearSums[minYear] += plot.areaAlq || 1;
      });
    } else {
      normalizedPlots.forEach((plot, idx) => {
        const targetYear = (idx % numAnos) + 1;
        newAlloc[targetYear].push(plot.name);
      });
    }

    setYearAllocations(newAlloc);
  }, [normalizedPlots, numAnos]);

  // Auto-distribuir se não houver alocação prévia e a lista de talhões ou ciclo mudar
  useEffect(() => {
    const hasExistingAlloc = Object.values(yearAllocations).some((arr) => Array.isArray(arr) && arr.length > 0);
    if (normalizedPlots.length > 0 && !hasExistingAlloc) {
      handleAutoDistributePlots();
    }
  }, [normalizedPlots.length, handleAutoDistributePlots]);

  const togglePlotForYear = (plotName: string, targetYear: number) => {
    setYearAllocations((prev) => {
      const next = { ...prev };
      const currentList = next[targetYear] || [];

      if (currentList.includes(plotName)) {
        next[targetYear] = currentList.filter((name) => name !== plotName);
      } else {
        next[targetYear] = [...currentList, plotName];
      }

      return next;
    });
  };

  // Cálculo financeiro principal
  const computedResult = useMemo(() => {
    if (!equalizaService) return null;
    const percentualAnualAP = 1 / numAnos;
    return equalizaService.calculate({
      totalAlqueires: totalAlqueires === null ? 0 : totalAlqueires,
      percentualAnualAP,
      incluirFolha,
      incluirFungoNema,
      incluirCompactacao,
      descontoManual: descontoManual === null ? 0 : descontoManual,
    });
  }, [
    equalizaService,
    numAnos,
    totalAlqueires,
    incluirFolha,
    incluirFungoNema,
    incluirCompactacao,
    descontoManual,
  ]);

  useEffect(() => {
    setCalculationResult(computedResult);
  }, [computedResult]);

  // Auto-gerar Agenda de Pagamento quando parâmetros mudam (se não customizado manualmente)
  useEffect(() => {
    if (!equalizaService || !computedResult) return;
    if (isPaymentCustomized) return;

    const baseDate = new Date(startYear, 0, 1);
    const generated = equalizaService.generatePaymentSchedules(
      numAnos,
      computedResult.totalAnualContrato,
      baseDate,
      paymentPlanMode
    );
    setPaymentItems(generated);
  }, [equalizaService, computedResult, numAnos, startYear, paymentPlanMode, isPaymentCustomized]);

  // Auto-gerar Agenda de Execução de Campo quando parâmetros mudam (se não customizado manualmente)
  useEffect(() => {
    if (!equalizaService) return;
    if (isExecutionCustomized) return;

    const baseDate = new Date(startYear, 0, 1);
    const generated = equalizaService.generateSuggestedSchedules(
      numAnos,
      Object.entries(yearAllocations).map(([yr, plots]) => ({
        ano: parseInt(yr, 10),
        plotNames: plots,
      })),
      { incluirFolha, incluirCompactacao },
      baseDate
    );
    setExecutionItems(generated);
  }, [equalizaService, numAnos, startYear, yearAllocations, incluirFolha, incluirCompactacao, isExecutionCustomized]);

  // Soma total das parcelas configuradas
  const totalScheduledPayments = useMemo(
    () => Math.round(paymentItems.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) * 100) / 100,
    [paymentItems]
  );

  // Propagar valores, detalhes, cronograma de execução e pagamentos para o OrderForm
  useEffect(() => {
    if (!computedResult) return;

    const percentualAnualAP = 1 / numAnos;
    const effectiveOrderTotal =
      isPaymentCustomized && totalScheduledPayments > 0
        ? totalScheduledPayments
        : computedResult.totalPeriodoContrato;

    onValuesChange(effectiveOrderTotal);

    const normalizedPayments = paymentItems.map((p, idx) => ({
      ...p,
      installmentNumber: idx + 1,
      totalInstallments: paymentItems.length,
      numeroParcela: idx + 1,
      ano: p.cycleYear || 1,
      descricao: p.description,
    }));

    const serviceDetails = {
      contractYears: numAnos,
      anosCiclo: numAnos,
      startYear,
      paymentPlanMode,
      percentualAnualAP,
      percentualAnualConf: Math.max(0, 1 - percentualAnualAP),
      incluirFolha,
      incluirFungoNema,
      incluirCompactacao,
      descontoManual: descontoManual || 0,
      totalAlqueires: totalAlqueires || 0,
      totalAnualContrato: computedResult.totalAnualContrato,
      totalPeriodoContrato: effectiveOrderTotal,
      precoPorAlqueireAnual: computedResult.precoPorAlqueireAnual,
      parcelaAgosto: computedResult.parcelaAgosto,
      parcelaMarco: computedResult.parcelaMarco,
      yearAllocations,
      autoPlannedPayments: normalizedPayments,
      autoPlannedSchedules: executionItems,
    };

    if (onServiceDetailsChange) {
      onServiceDetailsChange(serviceDetails);
    }

    if (onProductsChange) {
      onProductsChange([
        {
          id: 'equaliza_contract',
          name: `Contrato Equaliza - ${numAnos} ${numAnos === 1 ? 'Ano' : 'Anos'}`,
          contractYears: numAnos,
          anosCiclo: numAnos,
          totalAlqueires: totalAlqueires || 0,
          quantity: totalAlqueires || 0,
          unitPrice: computedResult.precoPorAlqueireAnual,
          totalPrice: effectiveOrderTotal,
          serviceDetails,
        },
      ]);
    }
  }, [
    computedResult,
    numAnos,
    startYear,
    paymentPlanMode,
    incluirFolha,
    incluirFungoNema,
    incluirCompactacao,
    descontoManual,
    totalAlqueires,
    yearAllocations,
    paymentItems,
    executionItems,
    isPaymentCustomized,
    totalScheduledPayments,
    onValuesChange,
    onProductsChange,
    onServiceDetailsChange,
  ]);

  // --- Handlers de Parâmetros ---
  const handleAlqueiresChange = (newAlq: number | null) => {
    setTotalAlqueires(newAlq);
    if (onAreaChange && newAlq !== null && newAlq >= 0) {
      onAreaChange(Math.round(newAlq * 2.42 * 100) / 100);
    }
  };

  const handleAnosCicloChange = (val: string) => {
    setAnosCiclo(val);
    setIsPaymentCustomized(false);
    setIsExecutionCustomized(false);
    setExecutionFilterYear('all');
  };

  const handleStartYearChange = (newYear: number) => {
    setStartYear(newYear);
    setIsPaymentCustomized(false);
    setIsExecutionCustomized(false);
  };

  const handlePaymentModeChange = (mode: EqualizaPaymentPlanMode) => {
    setPaymentPlanMode(mode);
    if (mode !== 'personalizado') {
      setIsPaymentCustomized(false);
    }
  };

  // --- Handlers da Agenda de Pagamento ---
  const handleUpdatePaymentItem = (
    id: string,
    field: 'dueDate' | 'amount' | 'description' | 'cycleYear',
    value: string | number
  ) => {
    setIsPaymentCustomized(true);
    setPaymentItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'cycleYear') {
          const yr = Number(value) || 1;
          const cy = startYear + (yr - 1);
          return { ...item, cycleYear: yr, ano: yr, cycleLabel: `Ano ${yr} (Safra ${cy}/${cy + 1})` };
        }
        if (field === 'amount') {
          return { ...item, amount: Number(value) || 0 };
        }
        if (field === 'description') {
          return { ...item, description: String(value), descricao: String(value) };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleAddPaymentItem = () => {
    setIsPaymentCustomized(true);
    setPaymentPlanMode('personalizado');
    const lastItem = paymentItems[paymentItems.length - 1];
    const nextYear = lastItem?.cycleYear || 1;
    const defaultDate = lastItem?.dueDate || `${startYear}-08-30`;
    const nextIdx = paymentItems.length + 1;
    const cy = startYear + (nextYear - 1);

    const newItem: EqualizaPaymentItem = {
      id: generateUUID(),
      dueDate: defaultDate,
      amount: 0,
      cycleYear: nextYear,
      cycleLabel: `Ano ${nextYear} (Safra ${cy}/${cy + 1})`,
      installmentNumber: nextIdx,
      totalInstallments: nextIdx,
      description: `Parcela ${nextIdx} - Negociada`,
      status: 'Pendente',
      ano: nextYear,
      numeroParcela: nextIdx,
      descricao: `Parcela ${nextIdx} - Negociada`,
    };

    setPaymentItems((prev) => [...prev, newItem]);
  };

  const handleRemovePaymentItem = (id: string) => {
    if (paymentItems.length <= 1) return;
    setIsPaymentCustomized(true);
    setPaymentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDistributePaymentsEqually = () => {
    if (!computedResult || paymentItems.length === 0) return;
    const targetTotal = computedResult.totalPeriodoContrato;
    const count = paymentItems.length;
    const baseAmt = Math.floor((targetTotal / count) * 100) / 100;
    const remainder = Math.round((targetTotal - baseAmt * count) * 100) / 100;

    setIsPaymentCustomized(true);
    setPaymentItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        amount: idx === count - 1 ? Math.round((baseAmt + remainder) * 100) / 100 : baseAmt,
      }))
    );
  };

  const handleResetPayments = () => {
    setIsPaymentCustomized(false);
    if (paymentPlanMode === 'personalizado') {
      setPaymentPlanMode('semestral');
    } else if (equalizaService && computedResult) {
      const baseDate = new Date(startYear, 0, 1);
      setPaymentItems(
        equalizaService.generatePaymentSchedules(numAnos, computedResult.totalAnualContrato, baseDate, paymentPlanMode)
      );
    }
  };

  // --- Handlers da Agenda de Execução de Campo ---
  const handleUpdateExecutionItem = (
    id: string,
    field: 'scheduledDate' | 'stageName' | 'description' | 'yearCycle',
    value: string | number
  ) => {
    setIsExecutionCustomized(true);
    setExecutionItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'yearCycle') {
          const yr = Number(value) || 1;
          const cy = startYear + (yr - 1);
          return { ...item, yearCycle: yr, cycleLabel: `Ano ${yr} (Safra ${cy}/${cy + 1})` };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleAddExecutionItem = (targetYear = 1) => {
    setIsExecutionCustomized(true);
    const cy = startYear + (targetYear - 1);
    const cycleLabel = `Ano ${targetYear} (Safra ${cy}/${cy + 1})`;
    const newSched: EqualizaExecutionScheduleItem = {
      id: generateUUID(),
      scheduledDate: `${cy}-08-20`,
      description: `Visita Técnica de Acompanhamento - ${cycleLabel}`,
      yearCycle: targetYear,
      cycleLabel,
      stageName: 'Visita Técnica de Acompanhamento',
      plotNames: yearAllocations[targetYear] || [],
      status: 'Agendado',
      createdAt: new Date().toISOString(),
    };
    setExecutionItems((prev) => [...prev, newSched]);
  };

  const handleRemoveExecutionItem = (id: string) => {
    setIsExecutionCustomized(true);
    setExecutionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetExecutions = () => {
    setIsExecutionCustomized(false);
    if (equalizaService) {
      const baseDate = new Date(startYear, 0, 1);
      setExecutionItems(
        equalizaService.generateSuggestedSchedules(
          numAnos,
          Object.entries(yearAllocations).map(([yr, plots]) => ({
            ano: parseInt(yr, 10),
            plotNames: plots,
          })),
          { incluirFolha, incluirCompactacao },
          baseDate
        )
      );
    }
  };

  // Soma total de área única alocada nos talhões
  const totalUniqueAllocatedAlq = useMemo(() => {
    const selectedSet = new Set<string>();
    Object.values(yearAllocations).forEach((names) => {
      if (Array.isArray(names)) names.forEach((n) => selectedSet.add(n));
    });
    const totalHa = normalizedPlots
      .filter((p) => selectedSet.has(p.name))
      .reduce((sum, p) => sum + p.areaHa, 0);
    return Math.round((totalHa / 2.42) * 100) / 100;
  }, [yearAllocations, normalizedPlots]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="ml-2 text-sm text-muted-foreground">Carregando variáveis de custo do Equaliza...</p>
      </div>
    );
  }

  if (!equalizaService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const details = calculationResult?.details;
  const contractPeriodTotal = calculationResult?.totalPeriodoContrato ?? 0;
  const paymentDiff = Math.round((totalScheduledPayments - contractPeriodTotal) * 100) / 100;
  const filteredExecutions =
    executionFilterYear === 'all'
      ? executionItems
      : executionItems.filter((item) => String(item.yearCycle) === executionFilterYear);

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
            <Sparkles className="h-4 w-4 text-purple-600" />
            EQUALIZA (Contrato Multi-anual Inteligente)
          </h3>
          <p className="text-xs text-muted-foreground">
            Diluição de custo anual garantindo 100% da área com amostragem contínua (AP + Conferência).
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300 font-medium">
          {numAnos} {numAnos === 1 ? 'Safra Contratada' : 'Safras Contratadas'}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Parâmetros Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="equaliza-area">Área Total da Propriedade (Alqueires):</Label>
            <DecimalInput
              id="equaliza-area"
              value={totalAlqueires}
              onValueChange={handleAlqueiresChange}
              placeholder="Ex: 120"
            />
            {totalAlqueires && totalAlqueires >= 100 ? (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
                ✓ Desconto de 5% aplicado por área &gt;= 100 alqueires (Planilha Oficial)
              </span>
            ) : null}
          </div>

          <div>
            <Label htmlFor="equaliza-anos">Duração do Ciclo de AP / Contrato:</Label>
            <Select value={anosCiclo} onValueChange={handleAnosCicloChange}>
              <SelectTrigger id="equaliza-anos">
                <SelectValue placeholder="Selecione os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 ano (100% AP na safra)</SelectItem>
                <SelectItem value="2">2 anos (50% AP / 50% Conferência ao ano)</SelectItem>
                <SelectItem value="3">3 anos (33% AP / 67% Conferência ao ano)</SelectItem>
                <SelectItem value="4">4 anos (25% AP / 75% Conferência ao ano)</SelectItem>
                <SelectItem value="5">5 anos (20% AP / 80% Conferência ao ano)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="equaliza-safra">Safra / Ano Inicial do Contrato:</Label>
            <Select value={String(startYear)} onValueChange={(val) => handleStartYearChange(parseInt(val, 10))}>
              <SelectTrigger id="equaliza-safra">
                <SelectValue placeholder="Selecione a safra inicial" />
              </SelectTrigger>
              <SelectContent>
                {[currentCalYear, currentCalYear + 1, currentCalYear + 2, currentCalYear + 3].map((yr) => (
                  <SelectItem key={yr} value={String(yr)}>
                    Safra {yr}/{yr + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Define o ciclo inicial para a escala de safras e pagamentos.
            </span>
          </div>
        </div>

        {/* Serviços Adicionais */}
        <div className="p-3 bg-muted/30 border rounded-md space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Serviços Adicionais Inclusos no Contrato:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="equaliza-folha"
                checked={incluirFolha}
                onCheckedChange={(checked) => setIncluirFolha(checked === true)}
              />
              <Label htmlFor="equaliza-folha" className="cursor-pointer font-normal text-sm">
                Análise Foliar Anual
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="equaliza-fungo"
                checked={incluirFungoNema}
                onCheckedChange={(checked) => setIncluirFungoNema(checked === true)}
              />
              <Label htmlFor="equaliza-fungo" className="cursor-pointer font-normal text-sm">
                Fungo / Nematoide
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="equaliza-compactacao"
                checked={incluirCompactacao}
                onCheckedChange={(checked) => setIncluirCompactacao(checked === true)}
              />
              <Label htmlFor="equaliza-compactacao" className="cursor-pointer font-normal text-sm">
                Compactação de Solo
              </Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="equaliza-desconto">Desconto Manual Negociado (R$ por ano):</Label>
          <DecimalInput
            id="equaliza-desconto"
            value={descontoManual}
            onValueChange={(val) => setDescontoManual(val)}
            placeholder="Ex: R$ 98,00"
          />
        </div>

        {/* ALOCAÇÃO DE TALHÕES POR ANO DO CONTRATO */}
        <div className="border rounded-md p-3.5 bg-slate-50/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Alocação de Talhões por Ano de AP:
              </span>
              <p className="text-[11px] text-muted-foreground">
                Em cada ano, os talhões marcados recebem <strong>Amostragem em Grid (AP)</strong> e os demais recebem <strong>Conferência</strong>. Seleção livre por ano.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {totalUniqueAllocatedAlq > 0 && Math.abs((totalAlqueires || 0) - totalUniqueAllocatedAlq) >= 0.1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 shrink-0"
                  onClick={() => handleAlqueiresChange(totalUniqueAllocatedAlq)}
                >
                  Usar área dos talhões ({totalUniqueAllocatedAlq.toFixed(1)} alq)
                </Button>
              )}
              {normalizedPlots.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs text-purple-700 border-purple-300 hover:bg-purple-50 shrink-0"
                  onClick={handleAutoDistributePlots}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Auto-Distribuir Talhões
                </Button>
              )}
            </div>
          </div>

          {normalizedPlots.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
              Selecione uma fazenda com talhões cadastrados no topo do pedido para distribuir os talhões entre os anos de contrato.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: numAnos }, (_, i) => i + 1).map((yr) => {
                const assignedPlotNames = yearAllocations[yr] || [];
                const assignedAreaHa = normalizedPlots
                  .filter((p) => assignedPlotNames.includes(p.name))
                  .reduce((sum, p) => sum + p.areaHa, 0);
                const assignedAreaAlq = assignedAreaHa > 0 ? assignedAreaHa / 2.42 : 0;
                const targetAreaAlq = (totalAlqueires || 0) / numAnos;

                return (
                  <div key={yr} className="p-2.5 border rounded-lg bg-card space-y-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-xs text-purple-900">
                        {yr}° Ano (Safra {startYear + (yr - 1)}/{startYear + yr})
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {assignedAreaAlq > 0
                          ? `${assignedAreaAlq.toFixed(1)} alq`
                          : `Meta: ~${targetAreaAlq.toFixed(1)} alq`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 min-h-[40px]">
                      {normalizedPlots.map((plot) => {
                        const isSelectedHere = assignedPlotNames.includes(plot.name);
                        return (
                          <button
                            key={plot.id}
                            type="button"
                            onClick={() => togglePlotForYear(plot.name, yr)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                              isSelectedHere
                                ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                                : 'bg-muted/30 text-slate-700 hover:bg-muted border-slate-200'
                            }`}
                          >
                            {plot.name}
                            {plot.areaAlq > 0 && ` (${plot.areaAlq.toFixed(1)} alq)`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AGENDA DE EXECUÇÃO DE CAMPO (EDITÁVEL NA CRIAÇÃO DO PEDIDO) */}
        <div className="border rounded-md p-3.5 bg-emerald-50/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
            <button
              type="button"
              onClick={() => setShowExecutionSection((prev) => !prev)}
              className="text-left flex items-center gap-2 group"
            >
              <ClipboardList className="h-4 w-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  Agenda de Execução de Campo ({executionItems.length} etapas)
                  {showExecutionSection ? (
                    <ChevronUp className="h-3.5 w-3.5 text-emerald-700" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-emerald-700" />
                  )}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Edite datas, etapas ou adicione/remova visitas operacionais antes de criar o pedido.
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Select value={executionFilterYear} onValueChange={setExecutionFilterYear}>
                <SelectTrigger className="h-7 w-[125px] text-xs bg-white">
                  <SelectValue placeholder="Filtrar Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {Array.from({ length: numAnos }, (_, i) => i + 1).map((yr) => (
                    <SelectItem key={yr} value={String(yr)}>
                      {yr}° Ano
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAddExecutionItem(executionFilterYear === 'all' ? 1 : parseInt(executionFilterYear, 10))
                }
                className="h-7 px-2 text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Etapa
              </Button>

              {isExecutionCustomized && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetExecutions}
                  className="h-7 px-2 text-xs bg-white text-slate-600 border-slate-300"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restaurar
                </Button>
              )}
            </div>
          </div>

          {showExecutionSection && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredExecutions.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground bg-white/70 rounded border border-dashed">
                  Nenhuma etapa programada para este filtro. Clique em "+ Etapa" para adicionar.
                </div>
              ) : (
                filteredExecutions.map((sched) => (
                  <div
                    key={sched.id}
                    className="p-2 border rounded-md bg-white/95 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs shadow-2xs"
                  >
                    <div className="sm:col-span-2">
                      <Select
                        value={String(sched.yearCycle || 1)}
                        onValueChange={(val) => handleUpdateExecutionItem(sched.id, 'yearCycle', parseInt(val, 10))}
                      >
                        <SelectTrigger className="h-7 text-xs bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: numAnos }, (_, i) => i + 1).map((yr) => (
                            <SelectItem key={yr} value={String(yr)}>
                              {yr}° Ano
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-3">
                      <Select
                        value={
                          EXECUTION_STAGE_OPTIONS.includes(sched.stageName)
                            ? sched.stageName
                            : 'Visita Técnica de Acompanhamento'
                        }
                        onValueChange={(val) => {
                          handleUpdateExecutionItem(sched.id, 'stageName', val);
                          handleUpdateExecutionItem(
                            sched.id,
                            'description',
                            `${val} - ${sched.cycleLabel || `Ano ${sched.yearCycle}`}`
                          );
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXECUTION_STAGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-4">
                      <Input
                        value={sched.description}
                        onChange={(e) => handleUpdateExecutionItem(sched.id, 'description', e.target.value)}
                        className="h-7 text-xs bg-slate-50"
                        placeholder="Descrição da visita / etapa"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        type="date"
                        value={sched.scheduledDate}
                        onChange={(e) => handleUpdateExecutionItem(sched.id, 'scheduledDate', e.target.value)}
                        className="h-7 text-xs bg-slate-50 px-1.5"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                        onClick={() => handleRemoveExecutionItem(sched.id)}
                        title="Remover etapa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* AGENDA DE PAGAMENTO (EDITÁVEL E ADAPTÁVEL NA CRIAÇÃO DO PEDIDO) */}
        <div className="border rounded-md p-3.5 bg-blue-50/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b pb-2 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                Agenda de Pagamento ({paymentItems.length}{' '}
                {paymentItems.length === 1 ? 'parcela' : 'parcelas'}):
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Escolha o modelo ou personalize datas, valores e quantidade de parcelas conforme negociado.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Select
                value={paymentPlanMode}
                onValueChange={(val) => handlePaymentModeChange(val as EqualizaPaymentPlanMode)}
              >
                <SelectTrigger className="h-7 w-[195px] text-xs bg-white border-blue-200">
                  <SelectValue placeholder="Modelo de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semestral">Semestral (2x/ano - Ago/Mar)</SelectItem>
                  <SelectItem value="anual">Anual (1x/ano - Safra)</SelectItem>
                  <SelectItem value="trimestral">Trimestral (4x/ano)</SelectItem>
                  <SelectItem value="personalizado">Personalizado (Livre)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPaymentItem}
                className="h-7 px-2 text-xs bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Parcela
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDistributePaymentsEqually}
                className="h-7 px-2 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                title="Dividir o valor total do período igualmente entre as parcelas"
              >
                Dividir Igual
              </Button>

              {isPaymentCustomized && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetPayments}
                  className="h-7 px-2 text-xs bg-white text-slate-600 border-slate-300"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restaurar
                </Button>
              )}
            </div>
          </div>

          {/* Barra de conciliação financeira */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white/80 px-2.5 py-1.5 rounded border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">
                Soma das Parcelas: <strong className="text-blue-800">{equalizaService.formatCurrency(totalScheduledPayments)}</strong>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                Referência ({numAnos} {numAnos === 1 ? 'ano' : 'anos'}):{' '}
                <strong>{equalizaService.formatCurrency(contractPeriodTotal)}</strong>
              </span>
            </div>
            {Math.abs(paymentDiff) <= 0.05 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Parcelas conciliadas
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Diferença: {paymentDiff > 0 ? '+' : ''}
                  {equalizaService.formatCurrency(paymentDiff)}
                </span>
                <button
                  type="button"
                  onClick={handleDistributePaymentsEqually}
                  className="text-[11px] text-blue-700 underline font-semibold hover:text-blue-900"
                >
                  Igualar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {paymentItems.map((p, idx) => (
              <div
                key={p.id}
                className={`p-2.5 border rounded-lg bg-white/95 text-xs space-y-2 shadow-xs transition-all ${
                  isPaymentCustomized ? 'border-blue-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-blue-800 shrink-0">{idx + 1}ª</span>
                    <Select
                      value={String(p.cycleYear || 1)}
                      onValueChange={(val) => handleUpdatePaymentItem(p.id, 'cycleYear', parseInt(val, 10))}
                    >
                      <SelectTrigger className="h-6 text-[11px] px-1.5 w-[74px] bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: numAnos }, (_, i) => i + 1).map((yr) => (
                          <SelectItem key={yr} value={String(yr)}>
                            Ano {yr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-600 shrink-0"
                      onClick={() => handleRemovePaymentItem(p.id)}
                      title="Remover parcela"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <Input
                  value={p.description}
                  onChange={(e) => handleUpdatePaymentItem(p.id, 'description', e.target.value)}
                  className="h-7 text-xs bg-slate-50 border-slate-200 px-2"
                  placeholder="Descrição da parcela"
                />

                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Vencimento</label>
                    <Input
                      type="date"
                      value={p.dueDate}
                      onChange={(e) => handleUpdatePaymentItem(p.id, 'dueDate', e.target.value)}
                      className="h-7 text-xs bg-slate-50 border-slate-200 font-medium px-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Valor (R$)</label>
                    <DecimalInput
                      value={p.amount}
                      onValueChange={(val) => handleUpdatePaymentItem(p.id, 'amount', val ?? 0)}
                      className="h-7 text-xs bg-slate-50 border-slate-200 font-bold text-blue-700 px-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo do Contrato */}
      <div className="mt-4 pt-3 border-t space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Resumo do Contrato Equaliza:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-md border">
            <span className="text-xs text-muted-foreground block">Valor Anual do Contrato</span>
            <strong className="text-lg text-primary">
              {equalizaService.formatCurrency(calculationResult?.totalAnualContrato ?? 0)}
            </strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md border">
            <span className="text-xs text-muted-foreground block">
              Total Período ({numAnos} {numAnos === 1 ? 'ano' : 'anos'})
            </span>
            <strong className="text-lg text-foreground">
              {equalizaService.formatCurrency(
                isPaymentCustomized && totalScheduledPayments > 0
                  ? totalScheduledPayments
                  : calculationResult?.totalPeriodoContrato ?? 0
              )}
            </strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md border">
            <span className="text-xs text-muted-foreground block">Valor por Alqueire/Ano</span>
            <strong className="text-lg text-foreground">
              {equalizaService.formatCurrency(calculationResult?.precoPorAlqueireAnual ?? 0)}/ALQ
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-2.5 bg-green-50/70 rounded-md border border-green-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-green-800 font-medium block">Parcela Agosto (50%)</span>
              <strong className="text-sm text-green-900">
                {equalizaService.formatCurrency(calculationResult?.parcelaAgosto ?? 0)}
              </strong>
            </div>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div className="p-2.5 bg-green-50/70 rounded-md border border-green-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-green-800 font-medium block">Parcela Março (50%)</span>
              <strong className="text-sm text-green-900">
                {equalizaService.formatCurrency(calculationResult?.parcelaMarco ?? 0)}
              </strong>
            </div>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div className="p-2.5 bg-blue-50/70 rounded-md border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-800 font-medium block">Custo Mensal Equivalente</span>
              <strong className="text-sm text-blue-900">
                {equalizaService.formatCurrency(calculationResult?.parcelaMensal ?? 0)}/mês
              </strong>
            </div>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
        </div>

        {details && (
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded border">
            <p className="font-semibold text-foreground mb-1">Detalhamento de Custos Unitários por Alqueire/Ano:</p>
            <div className="flex justify-between">
              <span>• Agricultura de Precisão ({Math.round((1 / numAnos) * 100)}% ao ano):</span>
              <span>{equalizaService.formatCurrency(details.custoUnitarioAP)}/alq</span>
            </div>
            <div className="flex justify-between">
              <span>• Conferência de Solo ({Math.round((1 - 1 / numAnos) * 100)}% ao ano):</span>
              <span>{equalizaService.formatCurrency(details.custoUnitarioConferencia)}/alq</span>
            </div>
            {incluirFolha && (
              <div className="flex justify-between">
                <span>• Análise Foliar:</span>
                <span>{equalizaService.formatCurrency(details.custoUnitarioFolha)}/alq</span>
              </div>
            )}
            {incluirCompactacao && (
              <div className="flex justify-between">
                <span>• Compactação de Solo:</span>
                <span>{equalizaService.formatCurrency(details.custoUnitarioCompactacao)}/alq</span>
              </div>
            )}
            {incluirFungoNema && (
              <div className="flex justify-between">
                <span>• Fungo / Nematoide:</span>
                <span>{equalizaService.formatCurrency(details.custoUnitarioFungoNema)}/alq</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

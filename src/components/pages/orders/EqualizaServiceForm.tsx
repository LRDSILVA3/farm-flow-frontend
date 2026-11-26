import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EqualizaService, EqualizaCalculationResult } from '../../../services/EqualizaService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Calendar, MapPin, DollarSign, Layers, RotateCcw } from 'lucide-react';

interface EqualizaServiceFormProps {
  initialAlqueires: number;
  availablePlots?: Array<{ id: string; name: string; area?: string | number }>;
  onValuesChange: (calculatedValue: number) => void;
  onProductsChange?: (products: any[]) => void;
  onServiceDetailsChange?: (details: any) => void;
}

export const EqualizaServiceForm: React.FC<EqualizaServiceFormProps> = ({
  initialAlqueires,
  availablePlots = [],
  onValuesChange,
  onProductsChange,
  onServiceDetailsChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [totalAlqueires, setTotalAlqueires] = useState<number | null>(
    initialAlqueires === 0 ? null : initialAlqueires
  );
  const [anosCiclo, setAnosCiclo] = useState<string>('3'); // 2, 3, 4, 5 anos
  const currentCalYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Se hoje já passou de Agosto (Setembro a Dezembro), a safra contratada padrão já é a do próximo ciclo
  const defaultStartYear = currentMonth > 8 ? currentCalYear + 1 : currentCalYear;
  const [startYear, setStartYear] = useState<number>(defaultStartYear);
  const [customPaymentDates, setCustomPaymentDates] = useState<Record<number, string>>({});
  const [incluirFolha, setIncluirFolha] = useState<boolean>(false);
  const [incluirFungoNema, setIncluirFungoNema] = useState<boolean>(false);
  const [incluirCompactacao, setIncluirCompactacao] = useState<boolean>(false);
  const [descontoManual, setDescontoManual] = useState<number | null>(null);

  // Alocação dos talhões por ano do contrato: { [ano: number]: string[] }
  const [yearAllocations, setYearAllocations] = useState<Record<number, string[]>>({});

  const [calculationResult, setCalculationResult] = useState<EqualizaCalculationResult | null>(null);

  const equalizaService = useMemo(() => {
    if (costVariables.length > 0) {
      return new EqualizaService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    setTotalAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
  }, [initialAlqueires]);

  const numAnos = parseInt(anosCiclo, 10) || 3;

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

    // Se temos áreas conhecidas, ordenamos decrescente e usamos algoritmo greedy
    const hasAreas = normalizedPlots.some((p) => p.areaAlq > 0);

    if (hasAreas) {
      const sorted = [...normalizedPlots].sort((a, b) => b.areaAlq - a.areaAlq);
      const yearSums: Record<number, number> = {};
      for (let yr = 1; yr <= numAnos; yr++) yearSums[yr] = 0;

      sorted.forEach((plot) => {
        // Encontra o ano com menor área acumulada
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
      // Distribuição round-robin
      normalizedPlots.forEach((plot, idx) => {
        const targetYear = (idx % numAnos) + 1;
        newAlloc[targetYear].push(plot.name);
      });
    }

    setYearAllocations(newAlloc);
  }, [normalizedPlots, numAnos]);

  // Auto-distribuir se a lista de talhões mudar ou o ciclo de anos mudar
  useEffect(() => {
    if (normalizedPlots.length > 0) {
      handleAutoDistributePlots();
    }
  }, [anosCiclo, normalizedPlots.length]);

  const togglePlotForYear = (plotName: string, targetYear: number) => {
    setYearAllocations((prev) => {
      const next = { ...prev };
      const currentList = next[targetYear] || [];

      // Alterna o talhão especificamente no ano clicado (permitindo reamostrar em anos subsequentes se desejado)
      if (currentList.includes(plotName)) {
        next[targetYear] = currentList.filter((name) => name !== plotName);
      } else {
        next[targetYear] = [...currentList, plotName];
      }

      return next;
    });
  };

  useEffect(() => {
    if (equalizaService) {
      const anos = parseInt(anosCiclo, 10) || 3;
      const percentualAnualAP = 1 / anos;

      const result = equalizaService.calculate({
        totalAlqueires: totalAlqueires === null ? 0 : totalAlqueires,
        percentualAnualAP,
        incluirFolha,
        incluirFungoNema,
        incluirCompactacao,
        descontoManual: descontoManual === null ? 0 : descontoManual,
      });

      setCalculationResult(result);
      onValuesChange(result.totalAnualContrato);

      // Previsão das datas e parcelas de pagamento alinhadas com o ano inicial do contrato
      const contractBaseDate = new Date(startYear, 0, 1);
      const plannedDates = equalizaService.getAutoPlannedDates(anos, contractBaseDate);
      const paymentsWithCustomDates = plannedDates.payments.map((p) => ({
        ...p,
        dueDate: customPaymentDates[p.numeroParcela] || p.dueDate,
      }));

      // Previsão do cronograma de visitas/etapas
      const autoPlannedSchedules = equalizaService.generateSuggestedSchedules(
        anos,
        Object.entries(yearAllocations).map(([yr, plots]) => ({
          ano: parseInt(yr, 10),
          plotNames: plots,
        })),
        { incluirFolha, incluirCompactacao },
        contractBaseDate
      );

      const serviceDetails = {
        contractYears: anos,
        anosCiclo: anos,
        startYear,
        percentualAnualAP,
        percentualAnualConf: Math.max(0, 1 - percentualAnualAP),
        incluirFolha,
        incluirFungoNema,
        incluirCompactacao,
        descontoManual: descontoManual || 0,
        totalAlqueires: totalAlqueires || 0,
        totalAnualContrato: result.totalAnualContrato,
        totalPeriodoContrato: result.totalPeriodoContrato,
        precoPorAlqueireAnual: result.precoPorAlqueireAnual,
        parcelaAgosto: result.parcelaAgosto,
        parcelaMarco: result.parcelaMarco,
        yearAllocations,
        autoPlannedPayments: paymentsWithCustomDates,
        autoPlannedSchedules,
      };

      if (onServiceDetailsChange) {
        onServiceDetailsChange(serviceDetails);
      }

      if (onProductsChange) {
        onProductsChange([
          {
            id: 'equaliza_contract',
            name: `Contrato Equaliza - ${anos} Anos`,
            contractYears: anos,
            anosCiclo: anos,
            totalAlqueires: totalAlqueires || 0,
            quantity: totalAlqueires || 0,
            unitPrice: result.precoPorAlqueireAnual,
            totalPrice: result.totalAnualContrato,
            serviceDetails,
          },
        ]);
      }
    }
  }, [
    totalAlqueires,
    anosCiclo,
    startYear,
    customPaymentDates,
    incluirFolha,
    incluirFungoNema,
    incluirCompactacao,
    descontoManual,
    yearAllocations,
    onValuesChange,
    onProductsChange,
    onServiceDetailsChange,
    equalizaService,
  ]);

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
  const baseDate = useMemo(() => new Date(startYear, 0, 1), [startYear]);
  const autoPlannedDates = useMemo(() => {
    return equalizaService
      ? equalizaService.getAutoPlannedDates(numAnos, baseDate)
      : { firstDueDate: '', payments: [] };
  }, [equalizaService, numAnos, baseDate]);

  const paymentsList = useMemo(() => {
    return autoPlannedDates.payments.map((p) => {
      const customDate = customPaymentDates[p.numeroParcela];
      return {
        ...p,
        dueDate: customDate || p.dueDate,
        isCustom: Boolean(customDate && customDate !== p.dueDate),
      };
    });
  }, [autoPlannedDates, customPaymentDates]);

  const handlePaymentDateChange = (numeroParcela: number, newDate: string) => {
    setCustomPaymentDates((prev) => ({
      ...prev,
      [numeroParcela]: newDate,
    }));
  };

  const handleResetPaymentDates = () => {
    setCustomPaymentDates({});
  };

  const handleStartYearChange = (newYear: number) => {
    setStartYear(newYear);
    setCustomPaymentDates({});
  };

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
          {numAnos} Safras Contratadas
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
              onValueChange={(newAlq) => setTotalAlqueires(newAlq)}
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
            <Select value={anosCiclo} onValueChange={setAnosCiclo}>
              <SelectTrigger id="equaliza-anos">
                <SelectValue placeholder="Selecione os anos" />
              </SelectTrigger>
              <SelectContent>
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
                id="eq-folha"
                checked={incluirFolha}
                onCheckedChange={(checked) => setIncluirFolha(checked as boolean)}
              />
              <Label htmlFor="eq-folha" className="cursor-pointer text-xs font-medium">
                Análise Foliar Anual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eq-fungo"
                checked={incluirFungoNema}
                onCheckedChange={(checked) => setIncluirFungoNema(checked as boolean)}
              />
              <Label htmlFor="eq-fungo" className="cursor-pointer text-xs font-medium">
                Fungo / Nematóide
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eq-compacta"
                checked={incluirCompactacao}
                onCheckedChange={(checked) => setIncluirCompactacao(checked as boolean)}
              />
              <Label htmlFor="eq-compacta" className="cursor-pointer text-xs font-medium">
                Compactação de Solo
              </Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="equaliza-desconto">Desconto Manual Negociado (R$):</Label>
          <Input
            id="equaliza-desconto"
            type="number"
            step="any"
            value={descontoManual === null ? '' : descontoManual}
            onChange={(e) => {
              const val = e.target.value;
              setDescontoManual(val === '' ? null : parseFloat(val));
            }}
            min="0"
            placeholder="Ex: R$ 98,00"
          />
        </div>

        {/* SELETOR DE ÁREA E TALHÕES POR ANO DE AP (ORDEM DOS TALHÕES ONDE SERÁ FEITO A.P.) */}
        <div className="border rounded-md p-3.5 bg-slate-50/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-green-600" />
                Alocação de Talhões por Ano de AP (Ordem dos Talhões na Planilha):
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Em cada ano, os talhões selecionados recebem <strong>Amostragem em Grid (AP)</strong> e os demais recebem <strong>Conferência</strong>.
              </p>
            </div>

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

        {/* AGENDA DE PAGAMENTO E AUTO-PLANEJAMENTO (CONFORME PLANILHA) */}
        <div className="border rounded-md p-3.5 bg-blue-50/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b pb-2 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                Agenda de Pagamento (Agosto e Março / Customizável):
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Altere qualquer data de vencimento diretamente nos campos abaixo conforme combinado com o produtor.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-800 font-medium bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                1° Vencimento: {paymentsList[0]?.dueDate ? paymentsList[0].dueDate.split('-').reverse().join('/') : ''}
              </span>
              {Object.keys(customPaymentDates).length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetPaymentDates}
                  className="h-7 text-xs text-slate-600 hover:text-slate-900 border-slate-300"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restaurar Sugestão
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {paymentsList.map((p) => {
              const parcelValue = (calculationResult?.totalAnualContrato || 0) * 0.5;
              return (
                <div
                  key={p.numeroParcela}
                  className={`p-2.5 border rounded-lg bg-white/95 text-xs space-y-2 shadow-xs transition-all ${
                    p.isCustom ? 'border-purple-300 ring-1 ring-purple-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold block text-slate-800">
                          {p.numeroParcela}ª Parcela
                        </span>
                        {p.isCustom && (
                          <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-200">
                            Data Alterada
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {p.descricao}
                      </span>
                    </div>
                    <strong className="text-blue-700 font-bold text-sm whitespace-nowrap">
                      {equalizaService.formatCurrency(parcelValue)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                    <label
                      htmlFor={`due-date-${p.numeroParcela}`}
                      className="text-[11px] font-medium text-slate-600 flex items-center gap-1 whitespace-nowrap"
                    >
                      <Calendar className="h-3 w-3 text-blue-600" />
                      Vencimento:
                    </label>
                    <Input
                      id={`due-date-${p.numeroParcela}`}
                      type="date"
                      value={p.dueDate}
                      onChange={(e) => handlePaymentDateChange(p.numeroParcela, e.target.value)}
                      className="h-7 w-36 text-xs bg-slate-50 border-slate-200 font-medium px-2 py-0 focus-visible:ring-1"
                    />
                  </div>
                </div>
              );
            })}
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
            <span className="text-xs text-muted-foreground block">Total Período ({calculationResult?.anosContrato} anos)</span>
            <strong className="text-lg text-foreground">
              {equalizaService.formatCurrency(calculationResult?.totalPeriodoContrato ?? 0)}
            </strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md border">
            <span className="text-xs text-muted-foreground block">Valor por Alqueire/Ano</span>
            <strong className="text-lg text-foreground">
              {equalizaService.formatCurrency(calculationResult?.precoPorAlqueireAnual ?? 0)}/ALQ
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-muted/20 p-3 rounded-md border">
          <div>
            <span className="text-muted-foreground block">Parcela Anual Agosto (50%):</span>
            <span className="font-semibold text-sm">
              {equalizaService.formatCurrency(calculationResult?.parcelaAgosto ?? 0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Parcela Anual Março (50%):</span>
            <span className="font-semibold text-sm">
              {equalizaService.formatCurrency(calculationResult?.parcelaMarco ?? 0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Ou 12x Mensal:</span>
            <span className="font-semibold text-sm">
              {equalizaService.formatCurrency(calculationResult?.parcelaMensal ?? 0)}/mês
            </span>
          </div>
        </div>

        {details && (
          <div className="mt-2 p-2.5 border rounded-md text-xs space-y-1 bg-muted/10">
            <div className="font-semibold text-xs mb-1 text-muted-foreground">Composição Unitária Anual:</div>
            <div className="flex justify-between">
              <span>Parcela Anual AP:</span>
              <span>{equalizaService.formatCurrency(details.custoUnitarioAP)}/alq</span>
            </div>
            <div className="flex justify-between">
              <span>Parcela Anual Conferência:</span>
              <span>{equalizaService.formatCurrency(details.custoUnitarioConferencia)}/alq</span>
            </div>
            {details.custoUnitarioFolha > 0 && (
              <div className="flex justify-between">
                <span>Análise Foliar:</span>
                <span>{equalizaService.formatCurrency(details.custoUnitarioFolha)}/alq</span>
              </div>
            )}
            {details.custoUnitarioCompactacao > 0 && (
              <div className="flex justify-between">
                <span>Compactação de Solo:</span>
                <span>{equalizaService.formatCurrency(details.custoUnitarioCompactacao)}/alq</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

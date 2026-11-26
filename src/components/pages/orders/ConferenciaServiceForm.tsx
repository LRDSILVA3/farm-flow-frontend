import React, { useState, useEffect, useMemo } from 'react';
import { ConferenciaService, ConferenciaCalculationResult } from '../../../services/ConferenciaService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export interface ConferenciaPlotItem {
  id?: string;
  name?: string;
  area?: string | number;
  dataProvavelColeta?: string;
  observacao?: string;
  [key: string]: any;
}

interface ConferenciaServiceFormProps {
  initialAlqueires: number;
  initialNumAnalises: number;
  totalFarmAlqueires: number;
  plots?: any[];
  onPlotsChange?: (plots: any[]) => void;
  onAreaChange?: (areaHa: number) => void;
  onValuesChange: (calculatedValue: number) => void;
  onAllPlotsSelectedChange: (selected: boolean) => void;
  onProductsChange?: (products: any[]) => void;
}

export const ConferenciaServiceForm: React.FC<ConferenciaServiceFormProps> = ({
  initialAlqueires,
  initialNumAnalises,
  totalFarmAlqueires,
  plots,
  onPlotsChange,
  onAreaChange,
  onValuesChange,
  onAllPlotsSelectedChange,
  onProductsChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [distanciaFazendaKm, setDistanciaFazendaKm] = useState<number | null>(null);
  const [clienteDesejaNotaFiscal, setClienteDesejaNotaFiscal] = useState<boolean>(false);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(new Date());
  const [desejaAnaliseFisica, setDesejaAnaliseFisica] = useState<boolean>(false);
  const [percentualAnalises20_40cm, setPercentualAnalises20_40cm] = useState<number | null>(10);
  const [percentualAnalisesBIOAS, setPercentualAnalisesBIOAS] = useState<number | null>(0);
  const [alqueires, setAlqueires] = useState<number | null>(initialAlqueires === 0 ? null : initialAlqueires);
  const [numAnalises, setNumAnalises] = useState<number | null>(initialNumAnalises === 0 ? null : initialNumAnalises);
  const [isAllPlotsSelected, setIsAllPlotsSelected] = useState<boolean>(false);

  // Desconto e Valor Fechado (igual ao pedido de AP)
  const [descontoManual, setDescontoManual] = useState<number | null>(null);
  const [descontoPercentualManual, setDescontoPercentualManual] = useState<number | null>(null);
  const [valorFechadoManual, setValorFechadoManual] = useState<number | null>(null);
  const [descontoPctInput, setDescontoPctInput] = useState<string>('');
  const [descontoValorInput, setDescontoValorInput] = useState<string>('');
  const [valorFechadoInput, setValorFechadoInput] = useState<string>('');

  // Planejamento por área / talhão (Data Provável de Coleta e OBS)
  const [localPlots, setLocalPlots] = useState<ConferenciaPlotItem[]>(() => {
    if (plots && plots.length > 0) return plots;
    return [{ id: '1', name: 'Área 1', area: (initialAlqueires || 0) * 2.42, dataProvavelColeta: '', observacao: '' }];
  });

  const [calculationResult, setCalculationResult] = useState<ConferenciaCalculationResult | null>(null);

  const conferenciaService = useMemo(() => {
    if (costVariables.length > 0) {
      return new ConferenciaService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    setAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
  }, [initialAlqueires]);

  useEffect(() => {
    if (plots && plots.length > 0) {
      setLocalPlots(plots);
    }
  }, [plots]);

  const onPlotsChangeRef = React.useRef(onPlotsChange);
  React.useEffect(() => {
    onPlotsChangeRef.current = onPlotsChange;
  }, [onPlotsChange]);

  const handlePlotFieldChange = (index: number, field: 'dataProvavelColeta' | 'observacao', val: string) => {
    const updated = [...localPlots];
    updated[index] = { ...updated[index], [field]: val };
    setLocalPlots(updated);
    if (onPlotsChangeRef.current) {
      onPlotsChangeRef.current(updated);
    }
  };

  const onValuesChangeRef = React.useRef(onValuesChange);
  const onProductsChangeRef = React.useRef(onProductsChange);
  const lastValueRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  React.useEffect(() => {
    onProductsChangeRef.current = onProductsChange;
  }, [onProductsChange]);

  useEffect(() => {
    if (vencimentoServico && conferenciaService) {
      const formattedVencimento = format(vencimentoServico, 'dd/MM/yyyy');
      const alqueiresToCalculate = isAllPlotsSelected ? totalFarmAlqueires : (alqueires === null ? 0 : alqueires);
      const totalAlqueiresToUse = Math.max(totalFarmAlqueires || 0, alqueiresToCalculate);

      const result = conferenciaService.calculate({
        clienteDesejaNotaFiscal: clienteDesejaNotaFiscal ? 'S' : 'N',
        distanciaFazendaKm: distanciaFazendaKm === null ? 0 : distanciaFazendaKm,
        vencimentoServico: formattedVencimento,
        desejaAnaliseFisica: desejaAnaliseFisica ? 'S' : 'N',
        percentualAnalises20_40cm: percentualAnalises20_40cm === null ? 0 : percentualAnalises20_40cm,
        percentualAnalisesBIOAS: percentualAnalisesBIOAS === null ? 0 : percentualAnalisesBIOAS,
        alqueires: alqueiresToCalculate,
        numAnalises: numAnalises === null ? 0 : numAnalises,
        totalAlqueires: totalAlqueiresToUse,
        descontoManual: descontoManual === null ? undefined : descontoManual,
        descontoPercentualManual: descontoPercentualManual === null ? undefined : descontoPercentualManual,
        valorFechadoManual: valorFechadoManual === null ? undefined : valorFechadoManual,
      });

      setCalculationResult(result);

      if (lastValueRef.current === null || Math.abs(lastValueRef.current - result.totalValue) >= 0.01) {
        lastValueRef.current = result.totalValue;
        onValuesChangeRef.current(result.totalValue);
      }

      if (onProductsChangeRef.current) {
        onProductsChangeRef.current([
          {
            id: 'servico_coleta',
            type: 'SERVICO_CONFERENCIA',
            name: `SERVIÇO DE COLETA DE ANÁLISE DE CONFERÊNCIA (DISTÂNCIA: ${((distanciaFazendaKm || 0) * 2).toFixed(1)} Km)`,
            quantity: alqueiresToCalculate || 10,
            unit: 'ALQ',
            price: result.details.breakdown.coletaServicoPerAlq,
            totalPrice: result.details.breakdown.coletaServicoTotal,
            valorFechado: result.totalValue,
            desconto: result.desconto,
            descontoPercentual: result.descontoPercentual,
            plotsPlan: localPlots,
          },
          {
            id: 'analises_macro_prem',
            type: 'MACRO+S+P_REM',
            name: `ANÁLISE DE SOLO (MACRO+S+P_REM${desejaAnaliseFisica ? '+FÍSICA' : ''})`,
            quantity: numAnalises || 0,
            unit: 'PTOS',
            price: result.details.custoAnaliseFisica || 91.40,
            totalPrice: result.details.breakdown.analiseMacroTotal,
          },
          ...(result.details.numAnalises20_40cm > 0 ? [{
            id: 'analises_20_40',
            type: 'MACRO+S',
            name: 'ANÁLISE DE SOLO 20-40 CM (MACRO+S)',
            quantity: result.details.numAnalises20_40cm,
            unit: 'PTOS',
            price: result.details.breakdown.analise20_40Unit || 73.90,
            totalPrice: result.details.breakdown.analise20_40Total,
          }] : []),
          ...(result.details.numAnalisesBIOAS > 0 ? [{
            id: 'analises_bioas',
            type: 'BIOAS',
            name: 'ANÁLISE BIOAS',
            quantity: result.details.numAnalisesBIOAS,
            unit: 'PTOS',
            price: result.details.breakdown.analiseBIOASUnit || 205.20,
            totalPrice: result.details.breakdown.analiseBIOASTotal,
          }] : []),
        ]);
      }
    }
  }, [
    distanciaFazendaKm,
    clienteDesejaNotaFiscal,
    vencimentoServico,
    desejaAnaliseFisica,
    percentualAnalises20_40cm,
    percentualAnalisesBIOAS,
    alqueires,
    numAnalises,
    totalFarmAlqueires,
    isAllPlotsSelected,
    conferenciaService,
    descontoManual,
    descontoPercentualManual,
    valorFechadoManual,
    localPlots,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!conferenciaService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const totalValue = calculationResult?.totalValue ?? 0;
  const totalValuePerAlq = calculationResult?.totalValuePerAlq ?? 0;
  const totalValuePerPoint = calculationResult?.totalValuePerPoint ?? 0;
  const valorTotalSugerido = calculationResult?.valorTotalSugerido ?? 0;
  const sugeridoPerAlq = calculationResult?.sugeridoPerAlq ?? 0;
  const desconto = calculationResult?.desconto ?? 0;
  const descontoPercentual = calculationResult?.descontoPercentual ?? 0;
  const descontoPerAlq = calculationResult?.descontoPerAlq ?? 0;
  const details = calculationResult?.details;

  const displayPlots = localPlots.length > 0 ? localPlots : [
    { id: '1', name: 'Área 1', area: (alqueires || 0) * 2.42, dataProvavelColeta: '', observacao: '' }
  ];

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conferência</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="nota-fiscal"
            checked={clienteDesejaNotaFiscal}
            onCheckedChange={setClienteDesejaNotaFiscal}
          />
          <Label htmlFor="nota-fiscal">Cliente deseja nota fiscal?</Label>
        </div>
        
        <div>
          <Label htmlFor="distancia-fazenda">Distância da fazenda - Km (ida):</Label>
          <Input
            id="distancia-fazenda"
            type="number" step="any"
            value={distanciaFazendaKm === null ? '' : distanciaFazendaKm}
            onChange={(e) => {
              const value = e.target.value;
              setDistanciaFazendaKm(value === '' ? null : parseFloat(value));
            }}
            min="0"
            placeholder="Ex: 20"
          />
        </div>
        
        <div>
          <Label htmlFor="vencimento-servico">Vencimento do serviço:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !vencimentoServico && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {vencimentoServico ? format(vencimentoServico, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={vencimentoServico}
                onSelect={setVencimentoServico}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="analise-fisica"
            checked={desejaAnaliseFisica}
            onCheckedChange={setDesejaAnaliseFisica}
          />
          <Label htmlFor="analise-fisica">Deseja análise física (fins bancários)?</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="perc-analises-20-40cm">% das análises de 20-40cm:</Label>
            <div className="flex items-center">
              <Input
                id="perc-analises-20-40cm"
                type="number" step="any"
                value={percentualAnalises20_40cm === null ? '' : percentualAnalises20_40cm}
                onChange={(e) => {
                  const value = e.target.value;
                  setPercentualAnalises20_40cm(value === '' ? null : parseFloat(value));
                }}
                min="0"
                max="100"
                className="w-full rounded-r-none"
              />
              <span className="flex items-center h-10 px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="perc-analises-bioas">% das Análises BIOAS:</Label>
            <div className="flex items-center">
              <Input
                id="perc-analises-bioas"
                type="number" step="any"
                value={percentualAnalisesBIOAS === null ? '' : percentualAnalisesBIOAS}
                onChange={(e) => {
                  const value = e.target.value;
                  setPercentualAnalisesBIOAS(value === '' ? null : parseFloat(value));
                }}
                min="0"
                max="100"
                className="w-full rounded-r-none"
                placeholder="0"
              />
              <span className="flex items-center h-10 px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="all-plots-selected"
            checked={isAllPlotsSelected}
            onCheckedChange={(checked) => {
              setIsAllPlotsSelected(checked);
              onAllPlotsSelectedChange(checked);
              if (checked) {
                setAlqueires(totalFarmAlqueires);
              } else {
                setAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
              }
            }}
          />
          <Label htmlFor="all-plots-selected">Selecionar todos os talhões da fazenda?</Label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="alqueires">Alqueires:</Label>
            <DecimalInput
              id="alqueires"
              value={isAllPlotsSelected ? totalFarmAlqueires : alqueires}
              onValueChange={(newAlq) => {
                setAlqueires(newAlq);
                if (newAlq !== null && onAreaChange) {
                  onAreaChange(newAlq * 2.42);
                }
                if (localPlots.length === 1 && newAlq !== null) {
                  const updated = [{ ...localPlots[0], area: (newAlq * 2.42).toFixed(2) }];
                  setLocalPlots(updated);
                  if (onPlotsChange) onPlotsChange(updated);
                }
              }}
              disabled={isAllPlotsSelected}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label htmlFor="hectares">Hectares (ha):</Label>
            <Input
              id="hectares"
              type="text"
              value={((alqueires || 0) * 2.42).toFixed(2).replace('.', ',')}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="num-analises">Número de análises:</Label>
            <Input
              id="num-analises"
              type="number" step="any"
              value={numAnalises === null ? '' : numAnalises}
              onChange={(e) => {
                const value = e.target.value;
                setNumAnalises(value === '' ? null : parseInt(value));
              }}
              min="0"
            />
          </div>
        </div>

        {/* Planejamento de Coleta por Talhão / Área (Data Provável da Coleta e OBS - INPUT CONFERENCIA Colunas H e I) */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Planejamento de Coleta por Área / Talhão:</Label>
            <span className="text-xs text-muted-foreground">
              {displayPlots.length} {displayPlots.length === 1 ? 'área' : 'áreas'}
            </span>
          </div>

          <div className="border rounded-md overflow-x-auto bg-background">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="py-2 px-3">Talhão / Área</th>
                  <th className="py-2 px-3">Área</th>
                  <th className="py-2 px-3 min-w-[150px]">Data Prov. Coleta</th>
                  <th className="py-2 px-3 min-w-[200px]">Observação (OBS)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayPlots.map((plot, idx) => {
                  const plotAreaHa = parseFloat(plot.area || '0') || 0;
                  const plotAreaAlq = plotAreaHa > 0 ? (plotAreaHa / 2.42).toFixed(2) : '-';
                  return (
                    <tr key={plot.id || idx} className="hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium text-foreground">
                        {plot.name || `Talhão ${idx + 1}`}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {plotAreaHa > 0
                          ? `${plotAreaHa.toFixed(2)} ha (${plotAreaAlq} alq)`
                          : `${((alqueires || 0) * 2.42).toFixed(2)} ha (${(alqueires || 0).toFixed(2)} alq)`}
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="date"
                          value={plot.dataProvavelColeta || ''}
                          onChange={(e) => handlePlotFieldChange(idx, 'dataProvavelColeta', e.target.value)}
                          className="h-8 text-xs bg-card"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="text"
                          placeholder="Ex: Pivô 1, colheita prevista..."
                          value={plot.observacao || ''}
                          onChange={(e) => handlePlotFieldChange(idx, 'observacao', e.target.value)}
                          className="h-8 text-xs bg-card"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloco de Negociação Comercial / Desconto / Valor Fechado (igual ao Pedido de AP) */}
        <div className="pt-3 border-t">
          <h4 className="text-sm font-semibold mb-2">Condições Comerciais e Desconto:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="conf-desconto-pct" className="text-xs font-medium">Desconto (%):</Label>
              <div className="relative mt-1">
                <Input
                  id="conf-desconto-pct"
                  type="text"
                  inputMode="decimal"
                  value={
                    descontoPctInput !== ''
                      ? descontoPctInput
                      : descontoPercentualManual !== null && descontoPercentualManual > 0
                      ? String(Number(descontoPercentualManual.toFixed(2))).replace('.', ',')
                      : ''
                  }
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setDescontoPctInput(raw);
                    setDescontoValorInput('');
                    setValorFechadoInput('');

                    const normalized = raw.replace(',', '.');
                    if (normalized.trim() === '' || normalized === '.') {
                      setDescontoPercentualManual(null);
                      setDescontoManual(null);
                      setValorFechadoManual(null);
                    } else {
                      const parsed = parseFloat(normalized);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setDescontoPercentualManual(parsed);
                        setDescontoManual(null);
                        setValorFechadoManual(null);
                      }
                    }
                  }}
                  onBlur={() => setDescontoPctInput('')}
                  placeholder="0,00%"
                  className="pr-7"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div>
              <Label htmlFor="conf-desconto-val" className="text-xs font-medium">Desconto em Valor (R$):</Label>
              <div className="relative mt-1">
                <Input
                  id="conf-desconto-val"
                  type="text"
                  inputMode="decimal"
                  value={
                    descontoValorInput !== ''
                      ? descontoValorInput
                      : descontoManual !== null && descontoManual > 0
                      ? String(Number(descontoManual.toFixed(2))).replace('.', ',')
                      : (desconto > 0 && !descontoPercentualManual && !valorFechadoManual)
                      ? desconto.toFixed(2).replace('.', ',')
                      : ''
                  }
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setDescontoValorInput(raw);
                    setDescontoPctInput('');
                    setValorFechadoInput('');

                    const normalized = raw.replace(',', '.');
                    if (normalized.trim() === '' || normalized === '.') {
                      setDescontoManual(null);
                      setDescontoPercentualManual(null);
                      setValorFechadoManual(null);
                    } else {
                      const parsed = parseFloat(normalized);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setDescontoManual(parsed);
                        setDescontoPercentualManual(null);
                        setValorFechadoManual(null);
                      }
                    }
                  }}
                  onBlur={() => setDescontoValorInput('')}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="conf-valor-fechado" className="text-xs font-medium">Valor Total Fechado (R$):</Label>
              <div className="relative mt-1">
                <Input
                  id="conf-valor-fechado"
                  type="text"
                  inputMode="decimal"
                  value={
                    valorFechadoInput !== ''
                      ? valorFechadoInput
                      : valorFechadoManual !== null && valorFechadoManual > 0
                      ? String(Number(valorFechadoManual.toFixed(2))).replace('.', ',')
                      : ''
                  }
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setValorFechadoInput(raw);
                    setDescontoPctInput('');
                    setDescontoValorInput('');

                    const normalized = raw.replace(',', '.');
                    if (normalized.trim() === '' || normalized === '.') {
                      setValorFechadoManual(null);
                      setDescontoManual(null);
                      setDescontoPercentualManual(null);
                    } else {
                      const parsed = parseFloat(normalized);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setValorFechadoManual(parsed);
                        setDescontoManual(null);
                        setDescontoPercentualManual(null);
                      }
                    }
                  }}
                  onBlur={() => setValorFechadoInput('')}
                  placeholder={valorTotalSugerido > 0 ? `Sugerido: ${valorTotalSugerido.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t space-y-3">
        <h4 className="text-md font-semibold">Valores Calculados:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">
              {desconto > 0 ? 'Valor Total Fechado' : 'Valor Total Sugerido'}
            </span>
            <strong className="text-lg text-primary">{conferenciaService.formatCurrency(totalValue)}</strong>
            {desconto > 0 && (
              <span className="text-xs text-muted-foreground block line-through">
                Sugerido: {conferenciaService.formatCurrency(valorTotalSugerido)}
              </span>
            )}
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Área</span>
            <strong className="text-lg">{conferenciaService.formatCurrency(totalValuePerAlq)}/ALQ</strong>
            {desconto > 0 && (
              <span className="text-xs text-muted-foreground block">
                Sugerido: {conferenciaService.formatCurrency(sugeridoPerAlq)}/alq
              </span>
            )}
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Ponto</span>
            <strong className="text-lg">{conferenciaService.formatCurrency(totalValuePerPoint)}/PTO</strong>
          </div>
        </div>

        {details && (
          <div className="mt-4 p-3 border rounded-md text-xs space-y-1.5 bg-muted/20">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição do Orçamento:</div>
            <div className="flex justify-between">
              <span>Serviço de Coleta de Análise:</span>
              <span className="font-medium">{conferenciaService.formatCurrency(details.breakdown.coletaServicoTotal)} ({conferenciaService.formatCurrency(details.breakdown.coletaServicoPerAlq)}/ALQ)</span>
            </div>
            <div className="flex justify-between">
              <span>Análise de Solo (Macro+S{desejaAnaliseFisica ? '+Física' : ''}):</span>
              <span className="font-medium">{conferenciaService.formatCurrency(details.breakdown.analiseMacroTotal)} ({conferenciaService.formatCurrency(details.breakdown.analiseMacroUnit)}/un)</span>
            </div>
            {details.numAnalises20_40cm > 0 && (
              <div className="flex justify-between">
                <span>Análise de Solo 20-40cm ({details.numAnalises20_40cm} un):</span>
                <span className="font-medium">{conferenciaService.formatCurrency(details.breakdown.analise20_40Total)} ({conferenciaService.formatCurrency(details.breakdown.analise20_40Unit)}/un)</span>
              </div>
            )}
            {details.numAnalisesBIOAS > 0 && (
              <div className="flex justify-between">
                <span>Análise BIOAS ({details.numAnalisesBIOAS} un):</span>
                <span className="font-medium">{conferenciaService.formatCurrency(details.breakdown.analiseBIOASTotal)} ({conferenciaService.formatCurrency(details.breakdown.analiseBIOASUnit)}/un)</span>
              </div>
            )}
            {desconto > 0 && (
              <div className="flex justify-between text-destructive py-1 border-t border-b font-medium">
                <span>DESCONTO DE -{descontoPercentual.toFixed(2)}% (-{conferenciaService.formatCurrency(descontoPerAlq)}/alq):</span>
                <span>-{conferenciaService.formatCurrency(desconto)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground pt-1 border-t">
              <span>Deslocamento ({distanciaFazendaKm || 0} km ida / {((distanciaFazendaKm || 0) * 2)} km total):</span>
              <span>{conferenciaService.formatCurrency(details.travelCost)} (R$ {details.valorKmCalculated.toFixed(2)}/km)</span>
            </div>
            {details.jurosFactor > 1 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Fator de juros até vencimento:</span>
                <span>{details.jurosFactor.toFixed(4)}x</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

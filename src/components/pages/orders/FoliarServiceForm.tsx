import React, { useState, useEffect, useMemo } from 'react';
import { FoliarService, FoliarCalculationResult } from '../../../services/FoliarService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export interface FoliarPlotItem {
  id?: string;
  name?: string;
  area?: string | number;
  dataPlantio?: string;
  variedade?: string;
  dataProvavelColeta?: string;
  [key: string]: any;
}

interface FoliarServiceFormProps {
  initialAlqueires: number;
  initialNumPontos: number;
  totalFarmAlqueires: number;
  plots?: any[];
  onPlotsChange?: (plots: any[]) => void;
  onAreaChange?: (areaHa: number) => void;
  onValuesChange: (calculatedValue: number) => void;
  onProductsChange?: (products: any[]) => void;
}

export const FoliarServiceForm: React.FC<FoliarServiceFormProps> = ({
  initialAlqueires,
  initialNumPontos,
  totalFarmAlqueires,
  plots,
  onPlotsChange,
  onAreaChange,
  onValuesChange,
  onProductsChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [calculoPor, setCalculoPor] = useState<'A' | 'P'>('P');
  const [distanciaFazendaKm, setDistanciaFazendaKm] = useState<number | null>(null);
  const [clienteDesejaNotaFiscal, setClienteDesejaNotaFiscal] = useState<boolean>(false);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(new Date());
  const [alqueires, setAlqueires] = useState<number | null>(initialAlqueires === 0 ? null : initialAlqueires);
  const [numPontos, setNumPontos] = useState<number | null>(initialNumPontos === 0 ? null : initialNumPontos);

  // Planejamento agronômico por talhão (Data Plantio, Variedade (P/M/T), Provável Coleta)
  const [localPlots, setLocalPlots] = useState<FoliarPlotItem[]>(() => {
    if (plots && plots.length > 0) return plots;
    return [{ id: '1', name: 'Área 1', area: (initialAlqueires || 0) * 2.42, dataPlantio: '', variedade: '', dataProvavelColeta: '' }];
  });

  const [calculationResult, setCalculationResult] = useState<FoliarCalculationResult | null>(null);

  const foliarService = useMemo(() => {
    if (costVariables.length > 0) {
      return new FoliarService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    if (plots && plots.length > 0) {
      setLocalPlots(plots);
    }
  }, [plots]);

  const onPlotsChangeRef = React.useRef(onPlotsChange);
  React.useEffect(() => {
    onPlotsChangeRef.current = onPlotsChange;
  }, [onPlotsChange]);

  const handlePlotFieldChange = (index: number, field: 'dataPlantio' | 'variedade' | 'dataProvavelColeta', val: string) => {
    const base = (plots && plots.length > 0) ? plots : localPlots;
    const updated = base.map((p, i) => (i === index ? { ...p, [field]: val } : p));
    setLocalPlots(updated);
    if (onPlotsChangeRef.current) {
      onPlotsChangeRef.current(updated);
    }
  };

  const displayPlots = useMemo(() => {
    if (plots && plots.length > 0) return plots;
    if (localPlots && localPlots.length > 0) return localPlots;
    return [{ id: '1', name: 'Área 1', area: (alqueires || 0) * 2.42, dataPlantio: '', variedade: '', dataProvavelColeta: '' }];
  }, [plots, localPlots, alqueires]);

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
    setAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
  }, [initialAlqueires]);

  useEffect(() => {
    if (vencimentoServico && foliarService) {
      const formattedVencimento = format(vencimentoServico, 'dd/MM/yyyy');
      const alqToCalc = alqueires === null ? 0 : alqueires;

      const result = foliarService.calculate({
        calculoPor,
        clienteDesejaNotaFiscal: clienteDesejaNotaFiscal ? 'S' : 'N',
        distanciaFazendaKm: distanciaFazendaKm === null ? 0 : distanciaFazendaKm,
        vencimentoServico: formattedVencimento,
        alqueires: alqToCalc,
        totalAlqueires: alqToCalc, // Budgeted area for this order
        numPontos: numPontos === null ? 0 : numPontos,
      });

      setCalculationResult(result);

      if (lastValueRef.current === null || Math.abs(lastValueRef.current - result.totalValue) >= 0.01) {
        lastValueRef.current = result.totalValue;
        onValuesChangeRef.current(result.totalValue);
      }

      if (onProductsChangeRef.current) {
        const points = numPontos === null ? 0 : numPontos;
        const precoLabFoliar = foliarService.getVariableValue('VALOR_ANALISE_FOLIAR') || 90.00;
        const alq = alqToCalc > 0 ? alqToCalc : 1;
        const precoServicoUnit = alqToCalc > 0 ? result.details.custoCampoCalculado / alqToCalc : result.details.custoCampoCalculado;

        onProductsChangeRef.current([
          {
            id: 'servico_foliar',
            type: 'SERVICO_FOLIAR',
            name: `SERVIÇO DE COLETA DE ANÁLISE FOLIAR (${((distanciaFazendaKm || 0) * 2).toFixed(1)} Km ida/volta)`,
            quantity: alqToCalc > 0 ? alqToCalc : points,
            unit: alqToCalc > 0 ? 'ALQ' : 'PTOS',
            price: precoServicoUnit,
            plotsPlan: displayPlots,
            points: points,
          },
          ...(points > 0 ? [{
            id: 'analise_foliar',
            type: 'ANALISE DE FOLIAR',
            name: 'ANÁLISE FOLIAR (NUTRIÇÃO FOLIAR)',
            quantity: points,
            unit: 'PTOS',
            price: precoLabFoliar
          }] : [])
        ]);
      }
    }
  }, [
    calculoPor,
    distanciaFazendaKm,
    clienteDesejaNotaFiscal,
    vencimentoServico,
    alqueires,
    numPontos,
    foliarService,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!foliarService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const totalValue = calculationResult?.totalValue ?? 0;
  const totalValuePerAlq = calculationResult?.totalValuePerAlq ?? 0;
  const totalValuePerPoint = calculationResult?.totalValuePerPoint ?? 0;
  const details = calculationResult?.details;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cálculo de Coleta Foliar</h3>
        
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="foliar-nf"
            checked={clienteDesejaNotaFiscal}
            onCheckedChange={setClienteDesejaNotaFiscal}
          />
          <Label htmlFor="foliar-nf">Cliente deseja nota fiscal?</Label>
        </div>

        <div>
          <Label htmlFor="foliar-distancia">Distância da fazenda - Km (ida):</Label>
          <Input
            id="foliar-distancia"
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
          <Label htmlFor="foliar-vencimento">Vencimento do serviço:</Label>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="foliar-alqueires">Alqueires:</Label>
            <DecimalInput
              id="foliar-alqueires"
              value={alqueires}
              onValueChange={(newAlq) => {
                setAlqueires(newAlq);
                if (newAlq !== null && onAreaChange) {
                  onAreaChange(newAlq * 2.42);
                }
                if (localPlots.length <= 1) {
                  const updated = [{ ...displayPlots[0], area: (newAlq || 0) * 2.42 }];
                  setLocalPlots(updated);
                  if (onPlotsChangeRef.current) {
                    onPlotsChangeRef.current(updated);
                  }
                }
              }}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label htmlFor="foliar-hectares">Hectares (ha):</Label>
            <Input
              id="foliar-hectares"
              type="text"
              value={((alqueires || 0) * 2.42).toFixed(2).replace('.', ',')}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="foliar-pontos" className="flex items-center gap-1 font-semibold">
              Número de pontos:
              <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input
              id="foliar-pontos"
              type="number"
              step="any"
              value={numPontos === null ? '' : numPontos}
              onChange={(e) => {
                const value = e.target.value;
                setNumPontos(value === '' ? null : parseInt(value));
              }}
              min="1"
              placeholder="Ex: 10 (obrigatório)"
              className={cn(
                "transition-colors",
                (!numPontos || numPontos <= 0) && "border-amber-500 focus-visible:ring-amber-500"
              )}
            />
            {(!numPontos || numPontos <= 0) && (
              <span className="text-[11px] text-amber-600 font-medium block mt-1">
                * Obrigatório: informe os pontos de amostragem
              </span>
            )}
          </div>
        </div>

        {/* Planejamento Agronômico por Talhão / Área (Data Plantio, Variedade P/M/T, Provável Coleta - Conforme Planilha INPUT FOLHA) */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Planejamento Agronômico por Talhão / Área:</Label>
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
                  <th className="py-2 px-3 min-w-[140px]">Data Plantio</th>
                  <th className="py-2 px-3 min-w-[150px]">Variedade (P/M/T)</th>
                  <th className="py-2 px-3 min-w-[140px]">Provável Coleta</th>
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
                          value={plot.dataPlantio || ''}
                          onChange={(e) => handlePlotFieldChange(idx, 'dataPlantio', e.target.value)}
                          className="h-8 text-xs bg-card"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="text"
                          placeholder="Ex: TMG 7062 (P)"
                          value={plot.variedade || ''}
                          onChange={(e) => handlePlotFieldChange(idx, 'variedade', e.target.value)}
                          className="h-8 text-xs bg-card"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="date"
                          value={plot.dataProvavelColeta || ''}
                          onChange={(e) => handlePlotFieldChange(idx, 'dataProvavelColeta', e.target.value)}
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
      </div>

      <div className="mt-6 pt-4 border-t space-y-3">
        <h4 className="text-md font-semibold">Valores Calculados:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor Total do Trabalho</span>
            <strong className="text-lg text-primary">{foliarService.formatCurrency(totalValue)}</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Área</span>
            <strong className="text-lg">{foliarService.formatCurrency(totalValuePerAlq)}/ALQ</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Ponto</span>
            <strong className="text-lg">{foliarService.formatCurrency(totalValuePerPoint)}/PTO</strong>
          </div>
        </div>

        {details && (
          <div className="mt-4 p-3 border rounded-md text-xs space-y-1.5 bg-muted/20">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição do Orçamento:</div>
            <div className="flex justify-between">
              <span>Custo de Campo (Coleta):</span>
              <span className="font-medium">{foliarService.formatCurrency(details.custoCampoCalculado)}</span>
            </div>
            <div className="flex justify-between">
              <span>Análise Foliar em Laboratório ({details.numPontos} un):</span>
              <span className="font-medium">{foliarService.formatCurrency(details.custoLaboratorial)} (Inclusa)</span>
            </div>
            <div className="flex justify-between text-muted-foreground pt-1 border-t">
              <span>Deslocamento:</span>
              <span>{foliarService.formatCurrency(details.travelCost)} (R$ {details.valorKmCalculated.toFixed(2)}/km)</span>
            </div>
            {details.jurosFactor > 1 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Fator de juros até vencimento (3,0%/mês):</span>
                <span>{details.jurosFactor.toFixed(4)}x</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

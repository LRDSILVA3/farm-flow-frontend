import React, { useState, useEffect, useMemo } from 'react';
import { FoliarService, FoliarCalculationResult } from '../../../services/FoliarService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
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

interface FoliarServiceFormProps {
  initialAlqueires: number;
  initialNumPontos: number;
  totalFarmAlqueires: number;
  onValuesChange: (calculatedValue: number) => void;
  onProductsChange?: (products: any[]) => void;
}

export const FoliarServiceForm: React.FC<FoliarServiceFormProps> = ({
  initialAlqueires,
  initialNumPontos,
  totalFarmAlqueires,
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

  const [calculationResult, setCalculationResult] = useState<FoliarCalculationResult | null>(null);

  const foliarService = useMemo(() => {
    if (costVariables.length > 0) {
      return new FoliarService(costVariables);
    }
    return null;
  }, [costVariables]);

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
        onProductsChangeRef.current([
          {
            id: 'analise_foliar',
            type: 'ANALISE DE FOLIAR',
            name: 'ANÁLISE FOLIAR (NUTRIÇÃO FOLIAR)',
            quantity: points,
            unit: 'PTOS',
            price: 70.00
          }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calculo-por">Base de Cálculo do Orçamento:</Label>
            <Select value={calculoPor} onValueChange={(val: 'A' | 'P') => setCalculoPor(val)}>
              <SelectTrigger id="calculo-por">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Por Alqueire (A) - Recomendado &lt; 50 alq</SelectItem>
                <SelectItem value="P">Por Ponto (P) - Recomendado &gt; 50 alq</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="foliar-nf"
              checked={clienteDesejaNotaFiscal}
              onCheckedChange={setClienteDesejaNotaFiscal}
            />
            <Label htmlFor="foliar-nf">Cliente deseja nota fiscal?</Label>
          </div>
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
            <Input
              id="foliar-alqueires"
              type="number" step="any"
              value={alqueires === null ? '' : alqueires}
              onChange={(e) => {
                const value = e.target.value;
                setAlqueires(value === '' ? null : parseFloat(value));
              }}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="foliar-hectares">Hectares (ha):</Label>
            <Input
              id="foliar-hectares"
              type="number" step="any"
              value={((alqueires || 0) * 2.42).toFixed(2)}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="foliar-pontos">Número de pontos:</Label>
            <Input
              id="foliar-pontos"
              type="number" step="any"
              value={numPontos === null ? '' : numPontos}
              onChange={(e) => {
                const value = e.target.value;
                setNumPontos(value === '' ? null : parseInt(value));
              }}
              min="0"
            />
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

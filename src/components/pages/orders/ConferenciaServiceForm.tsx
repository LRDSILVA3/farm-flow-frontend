import React, { useState, useEffect, useMemo } from 'react';
import { ConferenciaService, ConferenciaCalculationResult } from '../../../services/ConferenciaService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ConferenciaServiceFormProps {
  initialAlqueires: number;
  initialNumAnalises: number;
  totalFarmAlqueires: number;
  onValuesChange: (calculatedValue: number) => void;
  onAllPlotsSelectedChange: (selected: boolean) => void;
  onProductsChange?: (products: any[]) => void;
}

export const ConferenciaServiceForm: React.FC<ConferenciaServiceFormProps> = ({
  initialAlqueires,
  initialNumAnalises,
  totalFarmAlqueires,
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
  const [alqueires, setAlqueires] = useState<number | null>(initialAlqueires === 0 ? null : initialAlqueires);
  const [numAnalises, setNumAnalises] = useState<number | null>(initialNumAnalises === 0 ? null : initialNumAnalises);
  const [isAllPlotsSelected, setIsAllPlotsSelected] = useState<boolean>(false);

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

      const result = conferenciaService.calculate({
        clienteDesejaNotaFiscal: clienteDesejaNotaFiscal ? 'S' : 'N',
        distanciaFazendaKm: distanciaFazendaKm === null ? 0 : distanciaFazendaKm,
        vencimentoServico: formattedVencimento,
        desejaAnaliseFisica: desejaAnaliseFisica ? 'S' : 'N',
        percentualAnalises20_40cm: percentualAnalises20_40cm === null ? 0 : percentualAnalises20_40cm,
        alqueires: alqueiresToCalculate,
        numAnalises: numAnalises === null ? 0 : numAnalises,
        totalAlqueires: totalFarmAlqueires,
      });

      setCalculationResult(result);

      if (lastValueRef.current === null || Math.abs(lastValueRef.current - result.totalValue) >= 0.01) {
        lastValueRef.current = result.totalValue;
        onValuesChangeRef.current(result.totalValue);
      }

      if (onProductsChangeRef.current) {
        onProductsChangeRef.current([
          {
            id: 'analises_macro_prem',
            type: 'MACRO+S+P_REM',
            name: 'ANÁLISE DE SOLO (MACRO+S+P_REM)',
            quantity: numAnalises || 10,
            unit: 'PTOS',
            price: result.details.custoAnaliseFisica || 105.30
          },
          ...(result.details.numAnalises20_40cm > 0 ? [{
            id: 'analises_20_40',
            type: 'MACRO+S',
            name: 'ANÁLISE DE SOLO 20-40 CM (MACRO+S)',
            quantity: result.details.numAnalises20_40cm,
            unit: 'PTOS',
            price: 70.00
          }] : []),
          ...(desejaAnaliseFisica ? [{
            id: 'analise_fisica',
            type: 'FISICA',
            name: 'ANÁLISE FÍSICA',
            quantity: 1,
            unit: 'UNID',
            price: 42.30
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
    alqueires,
    numAnalises,
    totalFarmAlqueires,
    isAllPlotsSelected,
    conferenciaService,
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
  const details = calculationResult?.details;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cálculo de Conferência de Solo</h3>
        
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
            <Input
              id="alqueires"
              type="number" step="any"
              value={isAllPlotsSelected ? totalFarmAlqueires : (alqueires === null ? '' : alqueires)}
              onChange={(e) => {
                const value = e.target.value;
                setAlqueires(value === '' ? null : parseFloat(value));
              }}
              min="0"
              disabled={isAllPlotsSelected}
            />
          </div>
          <div>
            <Label htmlFor="hectares">Hectares (ha):</Label>
            <Input
              id="hectares"
              type="number" step="any"
              value={((alqueires || 0) * 2.42).toFixed(2)}
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
      </div>

      <div className="mt-6 pt-4 border-t space-y-3">
        <h4 className="text-md font-semibold">Valores Calculados:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor Total do Trabalho</span>
            <strong className="text-lg text-primary">{conferenciaService.formatCurrency(totalValue)}</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Área</span>
            <strong className="text-lg">{conferenciaService.formatCurrency(totalValuePerAlq)}/ALQ</strong>
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
            <div className="flex justify-between text-muted-foreground pt-1 border-t">
              <span>Deslocamento ({distanciaFazendaKm || 0} km):</span>
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

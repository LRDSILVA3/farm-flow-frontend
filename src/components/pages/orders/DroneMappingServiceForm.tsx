import React, { useState, useEffect, useMemo } from 'react';
import { DroneMappingService, DroneMappingCalculationResult } from '../../../services/DroneMappingService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DroneMappingServiceFormProps {
  initialAlqueires: number;
  onValuesChange: (calculatedValue: number) => void;
}

export const DroneMappingServiceForm: React.FC<DroneMappingServiceFormProps> = ({
  initialAlqueires,
  onValuesChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [alqueires, setAlqueires] = useState<number | null>(initialAlqueires === 0 ? null : initialAlqueires);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(new Date());
  const [desconto, setDesconto] = useState<number | null>(null);

  // Seletores dos serviços (conforme linhas 27 e 28 do PEDIDO DRONE na planilha)
  const [servicoFungoNematoide, setServicoFungoNematoide] = useState<boolean>(true);
  const [servicoCurvasNivel, setServicoCurvasNivel] = useState<boolean>(false);

  const [calculationResult, setCalculationResult] = useState<DroneMappingCalculationResult | null>(null);

  const droneMappingService = useMemo(() => {
    if (costVariables.length > 0) {
      return new DroneMappingService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    setAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
  }, [initialAlqueires]);

  useEffect(() => {
    if (vencimentoServico && droneMappingService) {
      const formattedVencimento = format(vencimentoServico, 'dd/MM/yyyy');

      const result = droneMappingService.calculate({
        alqueires: alqueires === null ? 0 : alqueires,
        distanciaKm: distanciaKm === null ? 0 : distanciaKm,
        vencimentoServico: formattedVencimento,
        servicoFungoNematoide,
        servicoCurvasNivel,
        desconto: desconto === null ? 0 : desconto,
      });

      setCalculationResult(result);
      onValuesChange(result.totalValue);
    }
  }, [
    alqueires,
    distanciaKm,
    vencimentoServico,
    servicoFungoNematoide,
    servicoCurvasNivel,
    desconto,
    onValuesChange,
    droneMappingService,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!droneMappingService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const totalValue = calculationResult?.totalValue ?? 0;
  const totalValuePerAlq = calculationResult?.totalValuePerAlq ?? 0;
  const details = calculationResult?.details;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cálculo de Voo de Drone (Mapeamento)</h3>
        
      </div>

      {/* Seleção dos Serviços a Executar (Sinalize com X) */}
      <div className="p-3 border rounded-md bg-muted/20 space-y-2">
        <Label className="text-sm font-semibold text-foreground block">
          Serviços a executar (sinalize com "X"):
        </Label>
        <div className="space-y-2 pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="drone-servico-fungo"
              checked={servicoFungoNematoide}
              onCheckedChange={(checked) => setServicoFungoNematoide(!!checked)}
            />
            <label
              htmlFor="drone-servico-fungo"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Ortomosaico / Mapeamento de Fungo e Nematóide (Base: R$ 50/alq)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="drone-servico-curvas"
              checked={servicoCurvasNivel}
              onCheckedChange={(checked) => setServicoCurvasNivel(!!checked)}
            />
            <label
              htmlFor="drone-servico-curvas"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Ortomosaico / Projeto de Curvas de Nível (Base: R$ 100/alq)
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="drone-alqueires">Área em Alqueires:</Label>
            <Input
              id="drone-alqueires"
              type="number" step="any"
              value={alqueires === null ? '' : alqueires}
              onChange={(e) => {
                const value = e.target.value;
                setAlqueires(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 10"
            />
          </div>

          <div>
            <Label htmlFor="drone-distancia">Distância da fazenda - Km (ida):</Label>
            <Input
              id="drone-distancia"
              type="number" step="any"
              value={distanciaKm === null ? '' : distanciaKm}
              onChange={(e) => {
                const value = e.target.value;
                setDistanciaKm(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="drone-vencimento">Vencimento do serviço:</Label>
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

          <div>
            <Label htmlFor="drone-desconto">Desconto Manual (R$):</Label>
            <Input
              id="drone-desconto"
              type="number" step="any"
              value={desconto === null ? '' : desconto}
              onChange={(e) => {
                const value = e.target.value;
                setDesconto(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Opcional: R$ 0,00"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t space-y-3">
        <h4 className="text-md font-semibold">Valores Calculados:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor Total do Pedido</span>
            <strong className="text-lg text-primary">{droneMappingService.formatCurrency(totalValue)}</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Alqueire</span>
            <strong className="text-lg">{droneMappingService.formatCurrency(totalValuePerAlq)}/ALQ</strong>
          </div>
        </div>

        {details && (
          <div className="mt-4 p-3 border rounded-md text-xs space-y-1.5 bg-muted/20">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição do Orçamento:</div>
            <div className="flex justify-between">
              <span>Ortomosaico ({details.alqueires} alq):</span>
              <span className="font-medium">
                {droneMappingService.formatCurrency(details.subtotalArea)} ({droneMappingService.formatCurrency(details.precoUnitarioAlq)}/alq)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Deslocamento ({details.distanciaKm} km):</span>
              <span className="font-medium">
                {droneMappingService.formatCurrency(details.subtotalDeslocamento)} ({droneMappingService.formatCurrency(details.precoUnitarioKm)}/km)
              </span>
            </div>
            {details.desconto > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Desconto concedido:</span>
                <span>-{droneMappingService.formatCurrency(details.desconto)}</span>
              </div>
            )}
            {details.jurosFactor > 1 && (
              <div className="flex justify-between text-muted-foreground pt-1 border-t">
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

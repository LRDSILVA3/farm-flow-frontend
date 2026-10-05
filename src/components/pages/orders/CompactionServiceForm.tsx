import React, { useState, useEffect, useMemo } from 'react';
import { CompactionService, CompactionCalculationResult } from '../../../services/CompactionService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface CompactionServiceFormProps {
  initialNumPontos: number;
  onValuesChange: (calculatedValue: number) => void;
}

export const CompactionServiceForm: React.FC<CompactionServiceFormProps> = ({
  initialNumPontos,
  onValuesChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [numPontos, setNumPontos] = useState<number | null>(initialNumPontos === 0 ? null : initialNumPontos);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(new Date());
  const [desconto, setDesconto] = useState<number | null>(null);

  const [calculationResult, setCalculationResult] = useState<CompactionCalculationResult | null>(null);

  const compactionService = useMemo(() => {
    if (costVariables.length > 0) {
      return new CompactionService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    if (vencimentoServico && compactionService) {
      const formattedVencimento = format(vencimentoServico, 'dd/MM/yyyy');

      const result = compactionService.calculate({
        numPontos: numPontos === null ? 0 : numPontos,
        distanciaKm: distanciaKm === null ? 0 : distanciaKm,
        vencimentoServico: formattedVencimento,
        desconto: desconto === null ? 0 : desconto,
      });

      setCalculationResult(result);
      onValuesChange(result.totalValue);
    }
  }, [
    numPontos,
    distanciaKm,
    vencimentoServico,
    desconto,
    onValuesChange,
    compactionService,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!compactionService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const totalValue = calculationResult?.totalValue ?? 0;
  const totalValuePerPoint = calculationResult?.totalValuePerPoint ?? 0;
  const details = calculationResult?.details;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cálculo de Compactação de Solo</h3>
        
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="compacta-pontos">Número de pontos:</Label>
            <Input
              id="compacta-pontos"
              type="number" step="any"
              value={numPontos === null ? '' : numPontos}
              onChange={(e) => {
                const value = e.target.value;
                setNumPontos(value === '' ? null : parseInt(value));
              }}
              min="0"
              placeholder="Ex: 4"
            />
          </div>

          <div>
            <Label htmlFor="compacta-distancia">Distância da fazenda - Km (ida):</Label>
            <Input
              id="compacta-distancia"
              type="number" step="any"
              value={distanciaKm === null ? '' : distanciaKm}
              onChange={(e) => {
                const value = e.target.value;
                setDistanciaKm(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="compacta-vencimento">Vencimento do serviço:</Label>
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
            <Label htmlFor="compacta-desconto">Desconto Manual (R$):</Label>
            <Input
              id="compacta-desconto"
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
            <strong className="text-lg text-primary">{compactionService.formatCurrency(totalValue)}</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor Médio por Ponto</span>
            <strong className="text-lg">{compactionService.formatCurrency(totalValuePerPoint)}/PTO</strong>
          </div>
        </div>

        {details && (
          <div className="mt-4 p-3 border rounded-md text-xs space-y-1.5 bg-muted/20">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição do Orçamento:</div>
            <div className="flex justify-between">
              <span>Pontos ({details.numPontos} un):</span>
              <span className="font-medium">{compactionService.formatCurrency(details.subtotalPontos)} ({compactionService.formatCurrency(details.precoUnitarioPonto)}/pto)</span>
            </div>
            <div className="flex justify-between">
              <span>Deslocamento ({details.distanciaKm} km):</span>
              <span className="font-medium">{compactionService.formatCurrency(details.subtotalDeslocamento)} ({compactionService.formatCurrency(details.precoUnitarioKm)}/km)</span>
            </div>
            {details.desconto > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Desconto concedido:</span>
                <span>-{compactionService.formatCurrency(details.desconto)}</span>
              </div>
            )}
            {details.jurosFactor > 1 && (
              <div className="flex justify-between text-muted-foreground pt-1 border-t">
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

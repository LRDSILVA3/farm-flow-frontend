import React, { useState, useEffect, useMemo } from 'react';
import { ConferenciaService } from '../../../services/ConferenciaService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


interface ConferenciaServiceFormProps {
  initialAlqueires: number;
  initialNumAnalises: number;
  onValuesChange: (calculatedValue: number) => void;
}

export const ConferenciaServiceForm: React.FC<ConferenciaServiceFormProps> = ({
  initialAlqueires,
  initialNumAnalises,
  onValuesChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [distanciaFazendaKm, setDistanciaFazendaKm] = useState<number>(0);
  const [clienteDesejaNotaFiscal, setClienteDesejaNotaFiscal] = useState<boolean>(false);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(new Date());
  const [desejaAnaliseFisica, setDesejaAnaliseFisica] = useState<boolean>(false);
  const [percentualAnalises20_40cm, setPercentualAnalises20_40cm] = useState<number>(0);
  const [alqueires, setAlqueires] = useState<number>(initialAlqueires);
  const [numAnalises, setNumAnalises] = useState<number>(initialNumAnalises);

  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalValuePerAlq, setTotalValuePerAlq] = useState<number>(0);
  const [totalValuePerPoint, setTotalValuePerPoint] = useState<number>(0);

  const conferenciaService = useMemo(() => {
    if (costVariables.length > 0) {
      return new ConferenciaService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    setAlqueires(initialAlqueires);
  }, [initialAlqueires]);

  useEffect(() => {
    if (vencimentoServico && conferenciaService) {
      const formattedVencimento = format(vencimentoServico, 'dd/MM/yyyy');
      const { totalValue } = conferenciaService.calculate({
        clienteDesejaNotaFiscal: clienteDesejaNotaFiscal ? 'S' : 'N',
        distanciaFazendaKm: distanciaFazendaKm,
        vencimentoServico: formattedVencimento,
        desejaAnaliseFisica: desejaAnaliseFisica ? 'S' : 'N',
        percentualAnalises20_40cm: percentualAnalises20_40cm,
        alqueires: alqueires,
        numAnalises: numAnalises,
      });

      setTotalValue(totalValue);
      setTotalValuePerAlq(alqueires > 0 ? totalValue / alqueires : 0);
      setTotalValuePerPoint(numAnalises > 0 ? totalValue / numAnalises : 0);
      onValuesChange(totalValue);
    }
  }, [
    distanciaFazendaKm,
    clienteDesejaNotaFiscal,
    vencimentoServico,
    desejaAnaliseFisica,
    percentualAnalises20_40cm,
    alqueires,
    numAnalises,
    onValuesChange,
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

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-semibold">Cálculo de conferência</h3>

      <div className="space-y-4">
        {/* Fields remain the same */}
        <div className="flex items-center space-x-2">
          <Switch
            id="nota-fiscal"
            checked={clienteDesejaNotaFiscal}
            onCheckedChange={setClienteDesejaNotaFiscal}
          />
          <Label htmlFor="nota-fiscal">Cliente deseja nota fiscal?</Label>
        </div>
        
        <div>
          <Label htmlFor="distancia-fazenda">Distância da fazenda - Km:</Label>
          <Input
            id="distancia-fazenda"
            type="number"
            value={distanciaFazendaKm}
            onChange={(e) => setDistanciaFazendaKm(parseFloat(e.target.value) || 0)}
            min="0"
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
          <Label htmlFor="analise-fisica">Deseja análise física?</Label>
        </div>

        <div>
          <Label htmlFor="perc-analises-20-40cm">% das análises de 20-40cm:</Label>
          <div className="flex items-center">
            <Input
              id="perc-analises-20-40cm"
              type="number"
              value={percentualAnalises20_40cm}
              onChange={(e) => setPercentualAnalises20_40cm(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full rounded-r-none"
            />
            <span className="flex items-center h-10 px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground">%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="alqueires">Alqueires:</Label>
            <Input
              id="alqueires"
              type="number"
              value={alqueires}
              onChange={(e) => setAlqueires(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="hectares">Hectares (ha):</Label>
            <Input
              id="hectares"
              type="number"
              value={(alqueires * 2.42).toFixed(2)}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="num-analises">Número de análises:</Label>
            <Input
              id="num-analises"
              type="number"
              value={numAnalises}
              onChange={(e) => setNumAnalises(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h4 className="text-md font-semibold">Valores calculados:</h4>
        <p>Valor total do trabalho (R$): <strong>{conferenciaService.formatCurrency(totalValue)}</strong></p>
        <p>Valor total por área (R$/ALQ): <strong>{conferenciaService.formatCurrency(totalValuePerAlq)}</strong></p>
        <p>Valor total por ponto (R$/PTO): <strong>{conferenciaService.formatCurrency(totalValuePerPoint)}</strong></p>
      </div>
    </div>
  );
};

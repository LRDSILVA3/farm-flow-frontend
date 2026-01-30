import React, { useState, useEffect } from 'react';
import { ConferenciaService } from '../../../services/ConferenciaService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
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

  const conferenciaService = new ConferenciaService();

  useEffect(() => {
    setAlqueires(initialAlqueires);
  }, [initialAlqueires]);

  useEffect(() => {
    if (vencimentoServico) {
      const formattedVencimento = format(vencimentoServico, 'dd/MM/yyyy');
      const { totalValue, details } = conferenciaService.calculate({
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
      onValuesChange(totalValue); // Notify parent component of the calculated value
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
  ]);

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-semibold">Cálculo de Conferência</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="nota-fiscal"
            checked={clienteDesejaNotaFiscal}
            onCheckedChange={setClienteDesejaNotaFiscal}
          />
          <Label htmlFor="nota-fiscal">Cliente deseja Nota Fiscal?</Label>
        </div>
        {clienteDesejaNotaFiscal && (
          <p className="text-sm text-green-600">SERÁ EMITIDA NF PARA CLIENTE</p>
        )}
      </div>

      <div>
        <Label htmlFor="distancia-fazenda">Distância da Fazenda (ida Cbl --&gt; área) - Km:</Label>
        <Input
          id="distancia-fazenda"
          type="number"
          value={distanciaFazendaKm}
          onChange={(e) => setDistanciaFazendaKm(parseFloat(e.target.value))}
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="vencimento-servico">Vencimento do Serviço (DD/MM/AA):</Label>
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
              {vencimentoServico ? format(vencimentoServico, "PPP") : <span>Selecione uma data</span>}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="analise-fisica"
            checked={desejaAnaliseFisica}
            onCheckedChange={setDesejaAnaliseFisica}
          />
          <Label htmlFor="analise-fisica">Deseja análise física (fins bancários)?</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="perc-analises-20-40cm">% das Análises de 20-40cm:</Label>
        <Input
          id="perc-analises-20-40cm"
          type="number"
          value={percentualAnalises20_40cm}
          onChange={(e) => setPercentualAnalises20_40cm(parseFloat(e.target.value))}
          min="0"
          max="100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="alqueires">Alqueires:</Label>
          <Input
            id="alqueires"
            type="number"
            value={alqueires}
            onChange={(e) => setAlqueires(parseFloat(e.target.value))}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="num-analises">Número de Análises:</Label>
          <Input
            id="num-analises"
            type="number"
            value={numAnalises}
            onChange={(e) => setNumAnalises(parseInt(e.target.value))}
            min="0"
          />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h4 className="text-md font-semibold">Valores Calculados:</h4>
        <p>VALOR TOTAL DO TRABALHO (R$): <strong>{conferenciaService.formatCurrency(totalValue)}</strong></p>
        <p>VALOR TOTAL POR ÁREA (R$/ALQ): <strong>{conferenciaService.formatCurrency(totalValuePerAlq)}</strong></p>
        <p>VALOR TOTAL POR PONTO (R$/PTO): <strong>{conferenciaService.formatCurrency(totalValuePerPoint)}</strong></p>
      </div>
    </div>
  );
};

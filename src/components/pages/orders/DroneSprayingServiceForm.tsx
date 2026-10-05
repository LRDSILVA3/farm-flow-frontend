import React, { useState, useEffect, useMemo } from 'react';
import { DroneSprayingService, DroneSprayingCalculationResult } from '../../../services/DroneSprayingService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DroneSprayingServiceFormProps {
  initialAreaHa: number;
  onValuesChange: (calculatedValue: number) => void;
}

export const DroneSprayingServiceForm: React.FC<DroneSprayingServiceFormProps> = ({
  initialAreaHa,
  onValuesChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [areaHa, setAreaHa] = useState<number | null>(initialAreaHa === 0 ? null : initialAreaHa);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(new Date());
  const [isProgramada, setIsProgramada] = useState<boolean>(false);
  const [isJaMapeada, setIsJaMapeada] = useState<boolean>(true);
  const [tipoSolidoOuLiquido, setTipoSolidoOuLiquido] = useState<'S' | 'L'>('L');
  const [doseSolidoKgAlq, setDoseSolidoKgAlq] = useState<number | null>(null);
  const [comNotaFiscal, setComNotaFiscal] = useState<boolean>(true);

  // Complexity factors
  const [numObstaculos, setNumObstaculos] = useState<number | null>(null);
  const [metrosBeiraMato, setMetrosBeiraMato] = useState<number | null>(null);
  const [metrosFiosLuz, setMetrosFiosLuz] = useState<number | null>(null);
  const [numPontosRTK, setNumPontosRTK] = useState<number | null>(null);

  const [calculationResult, setCalculationResult] = useState<DroneSprayingCalculationResult | null>(null);

  const droneSprayingService = useMemo(() => {
    if (costVariables.length > 0) {
      return new DroneSprayingService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    setAreaHa(initialAreaHa === 0 ? null : initialAreaHa);
  }, [initialAreaHa]);

  useEffect(() => {
    if (vencimentoServico && droneSprayingService) {
      const formattedVencimento = format(vencimentoServico, 'dd/MM/yyyy');

      const result = droneSprayingService.calculate({
        areaHa: areaHa === null ? 0 : areaHa,
        distanciaKm: distanciaKm === null ? 0 : distanciaKm,
        vencimentoServico: formattedVencimento,
        isProgramada,
        isJaMapeada,
        tipoSolidoOuLiquido,
        doseSolidoKgAlq: doseSolidoKgAlq === null ? 0 : doseSolidoKgAlq,
        comNotaFiscal,
        numObstaculos: numObstaculos === null ? 0 : numObstaculos,
        metrosBeiraMato: metrosBeiraMato === null ? 0 : metrosBeiraMato,
        metrosFiosLuz: metrosFiosLuz === null ? 0 : metrosFiosLuz,
        numPontosRTK: numPontosRTK === null ? 0 : numPontosRTK,
      });

      setCalculationResult(result);
      onValuesChange(result.totalValue);
    }
  }, [
    areaHa,
    distanciaKm,
    vencimentoServico,
    isProgramada,
    isJaMapeada,
    tipoSolidoOuLiquido,
    doseSolidoKgAlq,
    comNotaFiscal,
    numObstaculos,
    metrosBeiraMato,
    metrosFiosLuz,
    numPontosRTK,
    onValuesChange,
    droneSprayingService,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!droneSprayingService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const totalValue = calculationResult?.totalValue ?? 0;
  const precoPorAlqueire = calculationResult?.precoPorAlqueire ?? 0;
  const details = calculationResult?.details;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cálculo de Pulverização com Drone</h3>
        
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pulve-area">Área em Hectares (ha):</Label>
            <Input
              id="pulve-area"
              type="number" step="any"
              value={areaHa === null ? '' : areaHa}
              onChange={(e) => {
                const value = e.target.value;
                setAreaHa(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 50"
            />
            {areaHa && areaHa > 0 && (
              <span className="text-xs text-muted-foreground">
                Equivale a {(areaHa / 2.42).toFixed(2)} alqueires paulistas
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="pulve-distancia">Distância da sede - Km (ida):</Label>
            <Input
              id="pulve-distancia"
              type="number" step="any"
              value={distanciaKm === null ? '' : distanciaKm}
              onChange={(e) => {
                const value = e.target.value;
                setDistanciaKm(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pulve-vencimento">Vencimento do serviço:</Label>
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
            <Label>Tipo de Aplicação:</Label>
            <RadioGroup
              value={tipoSolidoOuLiquido}
              onValueChange={(val) => setTipoSolidoOuLiquido(val as 'S' | 'L')}
              className="flex items-center space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="L" id="tipo-liquido" />
                <Label htmlFor="tipo-liquido" className="cursor-pointer">Líquido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="S" id="tipo-solido" />
                <Label htmlFor="tipo-solido" className="cursor-pointer">Sólido</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {tipoSolidoOuLiquido === 'S' && (
          <div className="p-3 bg-muted/40 rounded-md">
            <Label htmlFor="pulve-dose">Dose de Sólido (kg/alqueire):</Label>
            <Input
              id="pulve-dose"
              type="number" step="any"
              value={doseSolidoKgAlq === null ? '' : doseSolidoKgAlq}
              onChange={(e) => {
                const value = e.target.value;
                setDoseSolidoKgAlq(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 150"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pulve-programada"
              checked={isProgramada}
              onCheckedChange={(checked) => setIsProgramada(checked as boolean)}
            />
            <Label htmlFor="pulve-programada" className="cursor-pointer">
              Aplicação Programada (Preço fechado/fixo)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pulve-mapeada"
              checked={isJaMapeada}
              onCheckedChange={(checked) => setIsJaMapeada(checked as boolean)}
            />
            <Label htmlFor="pulve-mapeada" className="cursor-pointer">
              Área já mapeada anteriormente
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pulve-nf"
            checked={comNotaFiscal}
            onCheckedChange={(checked) => setComNotaFiscal(checked as boolean)}
          />
          <Label htmlFor="pulve-nf" className="cursor-pointer">
            Com Nota Fiscal
          </Label>
        </div>

        {/* Complexity adjustments accordion / collapsible section */}
        <div className="border rounded-md p-3 space-y-3 bg-muted/20">
          <h4 className="text-sm font-medium">Obstáculos e Fatores de Dificuldade da Área (Opcional):</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="pulve-obstaculos" className="text-xs">Nº Obstáculos:</Label>
              <Input
                id="pulve-obstaculos"
                type="number" step="any"
                value={numObstaculos === null ? '' : numObstaculos}
                onChange={(e) => setNumObstaculos(e.target.value === '' ? null : parseInt(e.target.value))}
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="pulve-beiramato" className="text-xs">Beira de Mato (m):</Label>
              <Input
                id="pulve-beiramato"
                type="number" step="any"
                value={metrosBeiraMato === null ? '' : metrosBeiraMato}
                onChange={(e) => setMetrosBeiraMato(e.target.value === '' ? null : parseFloat(e.target.value))}
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="pulve-fiosluz" className="text-xs">Fios de Luz (m):</Label>
              <Input
                id="pulve-fiosluz"
                type="number" step="any"
                value={metrosFiosLuz === null ? '' : metrosFiosLuz}
                onChange={(e) => setMetrosFiosLuz(e.target.value === '' ? null : parseFloat(e.target.value))}
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="pulve-rtk" className="text-xs">Pontos RTK:</Label>
              <Input
                id="pulve-rtk"
                type="number" step="any"
                value={numPontosRTK === null ? '' : numPontosRTK}
                onChange={(e) => setNumPontosRTK(e.target.value === '' ? null : parseInt(e.target.value))}
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t space-y-3">
        <h4 className="text-md font-semibold">Valores Calculados:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor Total do Pedido</span>
            <strong className="text-lg text-primary">{droneSprayingService.formatCurrency(totalValue)}</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Alqueire</span>
            <strong className="text-lg">{droneSprayingService.formatCurrency(precoPorAlqueire)}/ALQ</strong>
          </div>
        </div>

        {details && (
          <div className="mt-4 p-3 border rounded-md text-xs space-y-1.5 bg-muted/20">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição e Fatores de Correção:</div>
            <div className="flex justify-between">
              <span>Deslocamento Serviço ({details.valorKmCalculated.toFixed(2)} R$/km):</span>
              <span className="font-medium">{droneSprayingService.formatCurrency(details.deslocamentoServico)}</span>
            </div>
            {details.deslocamentoMapeamento > 0 && (
              <div className="flex justify-between">
                <span>Deslocamento Mapeamento Inicial:</span>
                <span className="font-medium">{droneSprayingService.formatCurrency(details.deslocamentoMapeamento)}</span>
              </div>
            )}
            {(details.custoObstaculos + details.custoBeiraMato + details.custoFiosLuz + details.custoRTK) > 0 && (
              <div className="flex justify-between">
                <span>Adicional de Complexidade / Obstáculos:</span>
                <span className="font-medium">
                  {droneSprayingService.formatCurrency(details.custoObstaculos + details.custoBeiraMato + details.custoFiosLuz + details.custoRTK)}
                </span>
              </div>
            )}
            {details.fatorDoseSolido !== 1 && (
              <div className="flex justify-between">
                <span>Fator de Dose Sólido:</span>
                <span className="font-medium">{details.fatorDoseSolido.toFixed(4)}x</span>
              </div>
            )}
            {details.fatorImposto !== 1 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Ajuste sem NF:</span>
                <span>{(details.fatorImposto * 100).toFixed(0)}%</span>
              </div>
            )}
            {details.jurosFactor > 1 && (
              <div className="flex justify-between text-muted-foreground pt-1 border-t">
                <span>Fator juros a prazo:</span>
                <span>{details.jurosFactor.toFixed(4)}x</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

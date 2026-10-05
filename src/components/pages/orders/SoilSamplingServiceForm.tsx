import React, { useState, useEffect, useMemo } from 'react';
import { SoilSamplingService, SoilSamplingCalculationResult } from '../../../services/SoilSamplingService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Info, X, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface SoilSamplingServiceFormProps {
  initialAlqueires: number;
  initialNumPontos: number;
  initialProducts?: any[];
  onValuesChange: (calculatedValue: number) => void;
  onAreaChange?: (areaHa: number) => void;
  onProductsChange?: (products: any[]) => void;
}

export const SoilSamplingServiceForm: React.FC<SoilSamplingServiceFormProps> = ({
  initialAlqueires,
  initialNumPontos,
  initialProducts,
  onValuesChange,
  onAreaChange,
  onProductsChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [alqueires, setAlqueires] = useState<number | null>(initialAlqueires === 0 ? null : initialAlqueires);
  const [numPontos, setNumPontos] = useState<number | null>(initialNumPontos === 0 ? null : initialNumPontos);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(undefined);
  const [isReanalise, setIsReanalise] = useState<boolean>(false);
  const [comNotaFiscal, setComNotaFiscal] = useState<boolean>(true);

  // Chemical determination selections
  const [desejaAduboBase, setDesejaAduboBase] = useState<boolean>(true);
  const [desejaEnxofre, setDesejaEnxofre] = useState<boolean>(true);
  const [desejaMicronutrientes, setDesejaMicronutrientes] = useState<boolean>(true);
  const [desejaAnalise20_40cm, setDesejaAnalise20_40cm] = useState<boolean>(true);
  const [desejaAnaliseFisica, setDesejaAnaliseFisica] = useState<boolean>(false);

  // Discount & Final Closed Value (INPUT DADOS Linha 9 / PEDIDO Linha 44)
  const [descontoManual, setDescontoManual] = useState<number | null>(null);
  const [valorFechadoManual, setValorFechadoManual] = useState<number | null>(null);

  // Gabarito editável de distribuição de análises (INPUT DADOS Linhas 21-24)
  const [customNumCompleta, setCustomNumCompleta] = useState<number | string | null>(() => {
    const found = initialProducts?.find((p: any) => p.id === 'analises_completa' || p.type === 'MACRO+S+P_REM');
    return found && typeof found.quantity === 'number' ? found.quantity : null;
  });
  const [customNumMacro, setCustomNumMacro] = useState<number | string | null>(() => {
    const found = initialProducts?.find((p: any) => p.id === 'analises_macro' || (p.type === 'MACRO' && p.id !== 'analises_completa'));
    return found && typeof found.quantity === 'number' ? found.quantity : null;
  });
  const [customNum20_40, setCustomNum20_40] = useState<number | string | null>(() => {
    const found = initialProducts?.find((p: any) => p.id === 'analises_20_40' || p.type === 'MACRO+S');
    return found && typeof found.quantity === 'number' ? found.quantity : null;
  });
  const [customNumFisicas, setCustomNumFisicas] = useState<number | string | null>(() => {
    const found = initialProducts?.find((p: any) => p.id === 'analise_fisica' || p.type === 'FISICA');
    return found && typeof found.quantity === 'number' ? found.quantity : null;
  });

  const [calculationResult, setCalculationResult] = useState<SoilSamplingCalculationResult | null>(null);

  // Refs para estabilizar callbacks e prevenir loops de re-renderização
  const onValuesChangeRef = React.useRef(onValuesChange);
  const onProductsChangeRef = React.useRef(onProductsChange);
  const onAreaChangeRef = React.useRef(onAreaChange);
  const lastValueRef = React.useRef<number | null>(null);
  const lastProductsJsonRef = React.useRef<string>('');
  const lastAreaHaRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  React.useEffect(() => {
    onProductsChangeRef.current = onProductsChange;
  }, [onProductsChange]);

  React.useEffect(() => {
    onAreaChangeRef.current = onAreaChange;
  }, [onAreaChange]);

  // Hidratar gabarito caso initialProducts seja alterado
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      const fc = initialProducts.find((p: any) => p.id === 'analises_completa' || p.type === 'MACRO+S+P_REM');
      if (fc && typeof fc.quantity === 'number') setCustomNumCompleta(fc.quantity);
      const fm = initialProducts.find((p: any) => p.id === 'analises_macro' || (p.type === 'MACRO' && p.id !== 'analises_completa'));
      if (fm && typeof fm.quantity === 'number') setCustomNumMacro(fm.quantity);
      const f20 = initialProducts.find((p: any) => p.id === 'analises_20_40' || p.type === 'MACRO+S');
      if (f20 && typeof f20.quantity === 'number') setCustomNum20_40(f20.quantity);
      const ff = initialProducts.find((p: any) => p.id === 'analise_fisica' || p.type === 'FISICA');
      if (ff && typeof ff.quantity === 'number') setCustomNumFisicas(ff.quantity);
      const fAp = initialProducts.find((p: any) => p.id === 'servico_ap' || p.type === 'SERVICO_AP');
      if (fAp && typeof fAp.quantity === 'number' && fAp.quantity > 0) {
        setAlqueires(fAp.quantity);
      }
    }
  }, [initialProducts]);

  const soilSamplingService = useMemo(() => {
    if (costVariables.length > 0) {
      return new SoilSamplingService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    setAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
    if (initialAlqueires > 0) {
      lastAreaHaRef.current = Number((initialAlqueires * 2.42).toFixed(2));
    }
  }, [initialAlqueires]);

  // Sincroniza a área do pedido com os alqueires digitados no modal
  useEffect(() => {
    if (alqueires !== null && alqueires > 0 && onAreaChangeRef.current) {
      const areaHa = Number((alqueires * 2.42).toFixed(2));
      if (lastAreaHaRef.current === null || Math.abs(lastAreaHaRef.current - areaHa) > 0.05) {
        lastAreaHaRef.current = areaHa;
        onAreaChangeRef.current(areaHa);
      }
    }
  }, [alqueires]);

  // Recalcular apenas quando os dados de cálculo mudarem
  useEffect(() => {
    if (soilSamplingService) {
      const formattedVencimento = vencimentoServico ? format(vencimentoServico, 'dd/MM/yyyy') : undefined;
      const alq = alqueires === null ? 0 : alqueires;

      // Sugestão mínima de pontos se não informado
      const defaultPoints =
        numPontos === null ? (alq < 5 ? Math.floor(alq) + 1 : Math.floor((alq * 2.42) / 3) + 1) : numPontos;

      const result = soilSamplingService.calculate({
        isReanalise,
        comNotaFiscal,
        alqueires: alq,
        numPontos: defaultPoints,
        vencimentoServico: formattedVencimento,
        desejaAduboBase,
        desejaEnxofre,
        desejaMicronutrientes,
        desejaAnalise20_40cm,
        desejaAnaliseFisica,
        descontoManual: descontoManual === null ? undefined : descontoManual,
        valorFechadoManual: valorFechadoManual === null ? undefined : valorFechadoManual,
      });

      setCalculationResult(result);

      // Notifica o pai apenas se o valor mudou mais de 1 centavo
      if (lastValueRef.current === null || Math.abs(lastValueRef.current - result.totalValue) >= 0.01) {
        lastValueRef.current = result.totalValue;
        onValuesChangeRef.current(result.totalValue);
      }
    }
  }, [
    alqueires,
    numPontos,
    vencimentoServico,
    isReanalise,
    comNotaFiscal,
    desejaAduboBase,
    desejaEnxofre,
    desejaMicronutrientes,
    desejaAnalise20_40cm,
    desejaAnaliseFisica,
    descontoManual,
    valorFechadoManual,
    soilSamplingService,
  ]);

  const sugCompleta = calculationResult?.details.numAnalisesCompleta ?? 0;
  const sugMacro = calculationResult?.details.numAnalisesMacro ?? 0;
  const sug20_40 = calculationResult?.details.numAnalises20_40cm ?? 0;
  const sugFisicas = calculationResult?.details.numAnalisesFisicas ?? 0;

  const totalPontosSuperficiais =
    numPontos !== null && numPontos > 0
      ? numPontos
      : calculationResult
      ? sugCompleta + sugMacro
      : 0;

  const parseOrFallback = (val: number | string | null, fallback: number): number => {
    if (typeof val === 'number') return val;
    if (val === '') return 0;
    if (typeof val === 'string') {
      const p = parseInt(val, 10);
      return isNaN(p) ? fallback : p;
    }
    return fallback;
  };

  const effectiveCompleta = parseOrFallback(customNumCompleta, sugCompleta);
  const effectiveMacro = parseOrFallback(customNumMacro, sugMacro);
  const effective20_40 = parseOrFallback(customNum20_40, sug20_40);
  const effectiveFisicas = parseOrFallback(customNumFisicas, sugFisicas);

  const isCustomized =
    customNumCompleta !== null ||
    customNumMacro !== null ||
    customNum20_40 !== null ||
    customNumFisicas !== null;

  const handleResetDistribution = () => {
    setCustomNumCompleta(null);
    setCustomNumMacro(null);
    setCustomNum20_40(null);
    setCustomNumFisicas(null);
  };

  // Handler para alteração da análise Completa (0-20cm):
  // Regra da planilha Excel (B22 = B6 - B21):
  // Ao reduzir a Completa, a Macro Simples aumenta automaticamente (e Completa + Macro <= totalPontosSuperficiais)
  const handleCompletaChange = (valStr: string) => {
    if (valStr === '') {
      setCustomNumCompleta('');
      setCustomNumMacro(totalPontosSuperficiais);
      return;
    }

    const parsed = parseInt(valStr, 10);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    // Completa não pode ser maior que o total de pontos
    const cappedCompleta = Math.min(val, totalPontosSuperficiais);
    // Se reduz completa, aumenta a macro automaticamente com o saldo
    const newMacro = Math.max(0, totalPontosSuperficiais - cappedCompleta);

    setCustomNumCompleta(cappedCompleta);
    setCustomNumMacro(newMacro);
  };

  // Handler para alteração da Macro Simples:
  // Completa + Macro não pode ser maior que a quantidade de pontos
  const handleMacroChange = (valStr: string) => {
    if (valStr === '') {
      setCustomNumMacro('');
      return;
    }

    const parsed = parseInt(valStr, 10);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    const cappedMacro = Math.min(val, totalPontosSuperficiais);

    // Se completa + macro for ultrapassar o total de pontos, ajusta a completa
    if (effectiveCompleta + cappedMacro > totalPontosSuperficiais) {
      const adjustedCompleta = Math.max(0, totalPontosSuperficiais - cappedMacro);
      setCustomNumCompleta(adjustedCompleta);
    }

    setCustomNumMacro(cappedMacro);
  };

  // Sincroniza o gabarito quando o número de pontos mudar no formulário
  useEffect(() => {
    if (customNumCompleta !== null || customNumMacro !== null) {
      const curCompleta = parseOrFallback(customNumCompleta, sugCompleta);
      if (curCompleta > totalPontosSuperficiais) {
        setCustomNumCompleta(totalPontosSuperficiais);
        setCustomNumMacro(0);
      } else {
        setCustomNumMacro(Math.max(0, totalPontosSuperficiais - curCompleta));
      }
    }
  }, [totalPontosSuperficiais]);

  const totalAmostras = effectiveCompleta + effectiveMacro + effective20_40 + effectiveFisicas;

  // Sincroniza produtos com o componente pai garantindo envio das quantidades customizadas
  useEffect(() => {
    if (!calculationResult || !onProductsChangeRef.current) return;

    const valorUnitarioAnalise = calculationResult.details.valorUnitarioAnalise;

    const products = [
      ...(effectiveCompleta > 0 ? [{
        id: 'analises_completa',
        type: 'MACRO+S+P_REM',
        name: `ANÁLISE DE SOLO COMPLETA (MACRO+S+P_REM${desejaMicronutrientes ? '+MICRO' : ''})`,
        quantity: effectiveCompleta,
        unit: 'PTOS',
        price: valorUnitarioAnalise
      }] : []),
      ...(effectiveMacro > 0 ? [{
        id: 'analises_macro',
        type: 'MACRO',
        name: 'ANÁLISE DE SOLO SIMPLES (MACRO)',
        quantity: effectiveMacro,
        unit: 'PTOS',
        price: 52.30
      }] : []),
      ...((desejaAnalise20_40cm || effective20_40 > 0) && effective20_40 > 0 ? [{
        id: 'analises_20_40',
        type: 'MACRO+S',
        name: 'ANÁLISE DE SOLO 20-40 CM (MACRO+S)',
        quantity: effective20_40,
        unit: 'PTOS',
        price: 70.00
      }] : []),
      ...((desejaAnaliseFisica || effectiveFisicas > 0) && effectiveFisicas > 0 ? [{
        id: 'analise_fisica',
        type: 'FISICA',
        name: 'ANÁLISE FÍSICA (% ARGILA)',
        quantity: effectiveFisicas,
        unit: 'UNID',
        price: 42.30
      }] : []),
      {
        id: 'servico_ap',
        type: 'SERVICO_AP',
        name: isReanalise ? 'SERVIÇO A.P. - REANÁLISE' : 'SERVIÇO AGRICULTURA DE PRECISÃO',
        quantity: alqueires ?? 0,
        unit: 'ALQ',
        price: calculationResult.sugeridoPerAlq,
        totalPrice: calculationResult.valorTotalSugerido,
        valorFechado: calculationResult.totalValue,
        desconto: calculationResult.desconto,
        descontoPercentual: calculationResult.descontoPercentual,
        haPorPonto: calculationResult.details.haPorPonto,
        areaHa: calculationResult.details.hectares,
        determinationsSummary: calculationResult.details.determinationsSummary,
        desejaAduboBase,
        desejaEnxofre,
        desejaMicronutrientes,
        desejaAnalise20_40cm,
        desejaAnaliseFisica,
      }
    ];

    const json = JSON.stringify(products);
    if (lastProductsJsonRef.current !== json) {
      lastProductsJsonRef.current = json;
      onProductsChangeRef.current(products);
    }
  }, [
    calculationResult,
    alqueires,
    isReanalise,
    desejaAduboBase,
    desejaEnxofre,
    effectiveCompleta,
    effectiveMacro,
    effective20_40,
    effectiveFisicas,
    desejaMicronutrientes,
    desejaAnalise20_40cm,
    desejaAnaliseFisica,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!soilSamplingService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const totalValue = calculationResult?.totalValue ?? 0;
  const valorTotalSugerido = calculationResult?.valorTotalSugerido ?? 0;
  const desconto = calculationResult?.desconto ?? 0;
  const descontoPercentual = calculationResult?.descontoPercentual ?? 0;
  const totalValuePerAlq = calculationResult?.totalValuePerAlq ?? 0;
  const totalValuePerPoint = calculationResult?.totalValuePerPoint ?? 0;
  const sugeridoPerAlq = calculationResult?.sugeridoPerAlq ?? 0;
  const details = calculationResult?.details;

  const alqVal = alqueires || 0;
  const descontoPerAlq = alqVal > 0 ? desconto / alqVal : 0;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cálculo de Amostragem de Solo (AP / Reanálise)</h3>
        
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="ap-reanalise"
              checked={isReanalise}
              onCheckedChange={setIsReanalise}
            />
            <Label htmlFor="ap-reanalise">Reanálise de Solo (Área já trabalhada)?</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ap-nf"
              checked={comNotaFiscal}
              onCheckedChange={setComNotaFiscal}
            />
            <Label htmlFor="ap-nf">Cliente deseja nota fiscal?</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ap-alqueires">Área em Alqueires:</Label>
            <Input
              id="ap-alqueires"
              type="number"
              value={alqueires === null ? '' : alqueires}
              onChange={(e) => {
                const value = e.target.value;
                setAlqueires(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 50"
            />
          </div>

          <div>
            <Label htmlFor="ap-hectares">Hectares (ha):</Label>
            <Input
              id="ap-hectares"
              type="number"
              value={((alqueires || 0) * 2.42).toFixed(2)}
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="ap-pontos">Número de Pontos de Amostragem:</Label>
              {(() => {
                const currentHa = Number(((alqueires || 0) * 2.42).toFixed(2));
                const pts = numPontos || details?.numMinimoAnalises || 0;
                const density = currentHa > 0 && pts > 0 ? (currentHa / pts) : 0;
                return density > 0 ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {density.toFixed(2)} ha/ponto
                  </span>
                ) : null;
              })()}
            </div>
            <Input
              id="ap-pontos"
              type="number" step="any"
              value={numPontos === null ? '' : numPontos}
              onChange={(e) => {
                const value = e.target.value;
                setNumPontos(value === '' ? null : parseInt(value));
              }}
              min="0"
              placeholder={'Sugerido: ' + (details?.numMinimoAnalises || 0)}
            />
            {(() => {
              const currentHa = Number(((alqueires || 0) * 2.42).toFixed(2));
              const pts = numPontos || details?.numMinimoAnalises || 0;
              const density = currentHa > 0 && pts > 0 ? (currentHa / pts) : 0;
              return density > 0 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Densidade da malha: <strong>{density.toFixed(2)} ha</strong> por ponto de amostragem.
                </p>
              ) : null;
            })()}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="ap-vencimento">Vencimento do serviço (opcional):</Label>
            {vencimentoServico && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setVencimentoServico(undefined)}
              >
                <X className="h-3 w-3 mr-1" />
                Mudar para À Vista (Sem juros)
              </Button>
            )}
          </div>
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
                {vencimentoServico ? (
                  format(vencimentoServico, "PPP", { locale: ptBR })
                ) : (
                  <span>À Vista (Sem acréscimo de juros)</span>
                )}
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

        {/* Determinations selection (Marque com 'X' os resultados desejados no book) */}
        <div className="p-3 border rounded-md bg-muted/20 space-y-3">
          <Label className="font-semibold block text-sm">
            Determinações no Laudo / Book de Fertilidade:
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Switch id="ap-corretiva" checked={true} disabled />
              <Label htmlFor="ap-corretiva" className="text-xs text-muted-foreground cursor-not-allowed">
                Adubação Corretiva <span className="font-medium text-foreground">(Incluso - R$ 52,30)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="ap-adubo" checked={desejaAduboBase} onCheckedChange={setDesejaAduboBase} />
              <Label htmlFor="ap-adubo" className="text-xs cursor-pointer">Adubo de Base (+R$ 35,30)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="ap-enxofre" checked={desejaEnxofre} onCheckedChange={setDesejaEnxofre} />
              <Label htmlFor="ap-enxofre" className="text-xs cursor-pointer">Enxofre (+R$ 17,70)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="ap-micro" checked={desejaMicronutrientes} onCheckedChange={setDesejaMicronutrientes} />
              <Label htmlFor="ap-micro" className="text-xs cursor-pointer">Micronutrientes (+R$ 20,00)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="ap-20-40" checked={desejaAnalise20_40cm} onCheckedChange={setDesejaAnalise20_40cm} />
              <Label htmlFor="ap-20-40" className="text-xs cursor-pointer">
                Análise 20-40cm (Gesso) {details?.numAnalises20_40cm ? `(${details.numAnalises20_40cm} un)` : ''}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="ap-fisica" checked={desejaAnaliseFisica} onCheckedChange={setDesejaAnaliseFisica} />
              <Label htmlFor="ap-fisica" className="text-xs cursor-pointer">
                Análise Física (+R$ 42,30) {details?.numAnalisesFisicas ? `(${details.numAnalisesFisicas} un)` : ''}
              </Label>
            </div>
          </div>
        </div>

        {/* Campos de Desconto e Negociação (Excel INPUT DADOS Linha 9 / PEDIDO Linha 44) */}
        <div className="p-3 border rounded-md bg-muted/20 space-y-3">
          <div className="flex justify-between items-center">
            <Label className="font-semibold text-sm">Negociação de Preço / Desconto:</Label>
            {desconto > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                Desconto de -{descontoPercentual.toFixed(2)}% (-{soilSamplingService.formatCurrency(descontoPerAlq)}/alq)
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ap-desconto" className="text-xs">Desconto Manual (R$):</Label>
              <Input
                id="ap-desconto"
                type="number"
                value={descontoManual === null ? '' : descontoManual}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setDescontoManual(null);
                    setValorFechadoManual(null);
                  } else {
                    const desc = parseFloat(val) || 0;
                    setDescontoManual(desc);
                    setValorFechadoManual(null);
                  }
                }}
                min="0"
                step="0.01"
                placeholder="Ex: 1319.88"
              />
            </div>

            <div>
              <Label htmlFor="ap-valor-fechado" className="text-xs">Valor Total Fechado (R$):</Label>
              <Input
                id="ap-valor-fechado"
                type="number"
                value={valorFechadoManual === null ? '' : valorFechadoManual}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setValorFechadoManual(null);
                    setDescontoManual(null);
                  } else {
                    const fechado = parseFloat(val) || 0;
                    setValorFechadoManual(fechado);
                    setDescontoManual(null);
                  }
                }}
                min="0"
                step="0.01"
                placeholder={'Sugerido: ' + valorTotalSugerido.toFixed(2)}
              />
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
            <strong className="text-lg text-primary">{soilSamplingService.formatCurrency(totalValue)}</strong>
            {desconto > 0 && (
              <span className="text-xs text-muted-foreground block line-through">
                Sugerido: {soilSamplingService.formatCurrency(valorTotalSugerido)}
              </span>
            )}
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Alqueire</span>
            <strong className="text-lg">{soilSamplingService.formatCurrency(totalValuePerAlq)}/ALQ</strong>
            {desconto > 0 && (
              <span className="text-xs text-muted-foreground block">
                Sugerido: {soilSamplingService.formatCurrency(sugeridoPerAlq)}/alq
              </span>
            )}
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Ponto</span>
            <strong className="text-lg">{soilSamplingService.formatCurrency(totalValuePerPoint)}/PTO</strong>
          </div>
        </div>

        {details && (
          <div className="mt-4 p-3 border rounded-md text-xs space-y-1.5 bg-muted/20">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição do Orçamento:</div>
            
            <div className="flex justify-between py-1 border-b">
              <span>
                <strong>{isReanalise ? 'SERVIÇO A.P. - REANÁLISE' : 'SERVIÇO AGRICULTURA DE PRECISÃO'}</strong> ({alqueires || 0} ALQ):
              </span>
              <span className="font-medium">
                {soilSamplingService.formatCurrency(valorTotalSugerido)} ({soilSamplingService.formatCurrency(sugeridoPerAlq)}/alq)
              </span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span>ANÁLISE INCLUSA ({details.haPorPonto.toFixed(2)} ha/ponto) - {numPontos || 0} PTOS:</span>
              <span className="text-muted-foreground">R$ 0,00</span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span>RECOMENDAÇÕES DE CORRETIVOS{desejaAduboBase ? ' E ADUBAÇÃO DE BASE' : ''}:</span>
              <span className="text-muted-foreground">R$ 0,00</span>
            </div>

            {details.determinationsSummary && (
              <div className="flex justify-between py-1 border-b">
                <span>{details.determinationsSummary}:</span>
                <span className="text-muted-foreground">R$ 0,00</span>
              </div>
            )}

            {/* Quadro de Análises da Planilha com gabarito editável (Design sóbrio e neutro) */}
            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-foreground">
                    Distribuição de Análises (Gabarito da Planilha):
                  </span>
                  {isCustomized && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium border">
                      Editado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-normal text-muted-foreground">
                    Total: <strong className="text-foreground">{totalAmostras}</strong> amostras
                  </span>
                  {isCustomized && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={handleResetDistribution}
                      title="Restaurar gabarito sugerido pelo cálculo da planilha"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Restaurar
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground">
                <p>
                  Ao alterar a <strong>Completa</strong>, a <strong>Macro Simples</strong> é recalculada automaticamente (saldo de pontos).
                </p>
                <span className={cn(
                  "font-medium",
                  effectiveCompleta + effectiveMacro > totalPontosSuperficiais ? "text-destructive font-bold" : "text-muted-foreground"
                )}>
                  Superficial (0-20cm): <strong className="text-foreground">{effectiveCompleta + effectiveMacro}</strong> / {totalPontosSuperficiais} ptos
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* Completa (0-20cm) */}
                <div className="p-2.5 bg-background border rounded-md space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="gabarito-completa" className="text-[11px] font-medium text-foreground cursor-pointer">
                      Completa (0-20cm):
                    </Label>
                    <span className="text-[10px] text-muted-foreground">ptos</span>
                  </div>
                  <Input
                    id="gabarito-completa"
                    type="number"
                    min="0"
                    max={totalPontosSuperficiais}
                    step="1"
                    className="h-8 text-sm font-semibold text-foreground"
                    value={customNumCompleta !== null ? customNumCompleta : sugCompleta}
                    onChange={(e) => handleCompletaChange(e.target.value)}
                    onBlur={() => {
                      if (customNumCompleta === '') setCustomNumCompleta(0);
                    }}
                  />
                  <div className="text-[10px] text-muted-foreground flex justify-between items-center pt-0.5">
                    {customNumCompleta !== null && customNumCompleta !== sugCompleta ? (
                      <>
                        <span>Sugerido: {sugCompleta}</span>
                        <button
                          type="button"
                          onClick={() => setCustomNumCompleta(null)}
                          className="text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          reverter
                        </button>
                      </>
                    ) : (
                      <span>Máx: {totalPontosSuperficiais} ptos</span>
                    )}
                  </div>
                </div>

                {/* Macro Simples */}
                <div className="p-2.5 bg-background border rounded-md space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="gabarito-macro" className="text-[11px] font-medium text-foreground cursor-pointer">
                      Macro Simples:
                    </Label>
                    <span className="text-[10px] text-muted-foreground">ptos</span>
                  </div>
                  <Input
                    id="gabarito-macro"
                    type="number"
                    min="0"
                    max={totalPontosSuperficiais}
                    step="1"
                    className="h-8 text-sm font-semibold text-foreground"
                    value={customNumMacro !== null ? customNumMacro : sugMacro}
                    onChange={(e) => handleMacroChange(e.target.value)}
                    onBlur={() => {
                      if (customNumMacro === '') setCustomNumMacro(0);
                    }}
                  />
                  <div className="text-[10px] text-muted-foreground flex justify-between items-center pt-0.5">
                    {customNumMacro !== null && customNumMacro !== sugMacro ? (
                      <>
                        <span>Sugerido: {sugMacro}</span>
                        <button
                          type="button"
                          onClick={() => setCustomNumMacro(null)}
                          className="text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          reverter
                        </button>
                      </>
                    ) : (
                      <span>Saldo: {Math.max(0, totalPontosSuperficiais - effectiveCompleta)} ptos</span>
                    )}
                  </div>
                </div>

                {/* 20-40cm (MACRO+S) */}
                {(desejaAnalise20_40cm || customNum20_40 !== null || sug20_40 > 0) && (
                  <div className={cn(
                    "p-2.5 bg-background border rounded-md space-y-1.5",
                    !desejaAnalise20_40cm && customNum20_40 === null && "opacity-60"
                  )}>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="gabarito-20-40" className="text-[11px] font-medium text-foreground cursor-pointer">
                        20-40cm (MACRO+S):
                      </Label>
                      <span className="text-[10px] text-muted-foreground">ptos</span>
                    </div>
                    <Input
                      id="gabarito-20-40"
                      type="number"
                      min="0"
                      step="1"
                      className="h-8 text-sm font-semibold text-foreground"
                      value={customNum20_40 !== null ? customNum20_40 : sug20_40}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '') {
                          setCustomNum20_40('');
                        } else {
                          const parsed = parseInt(v, 10);
                          setCustomNum20_40(isNaN(parsed) ? 0 : Math.max(0, parsed));
                        }
                      }}
                      onBlur={() => {
                        if (customNum20_40 === '') setCustomNum20_40(0);
                      }}
                    />
                    <div className="text-[10px] text-muted-foreground flex justify-between items-center pt-0.5">
                      {customNum20_40 !== null && customNum20_40 !== sug20_40 ? (
                        <>
                          <span>Sugerido: {sug20_40}</span>
                          <button
                            type="button"
                            onClick={() => setCustomNum20_40(null)}
                            className="text-muted-foreground hover:text-foreground underline cursor-pointer"
                          >
                            reverter
                          </button>
                        </>
                      ) : (
                        <span>Subsuperficial</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Física (% Argila) */}
                {(desejaAnaliseFisica || customNumFisicas !== null || sugFisicas > 0) && (
                  <div className={cn(
                    "p-2.5 bg-background border rounded-md space-y-1.5",
                    !desejaAnaliseFisica && customNumFisicas === null && "opacity-60"
                  )}>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="gabarito-fisica" className="text-[11px] font-medium text-foreground cursor-pointer">
                        Física (% Argila):
                      </Label>
                      <span className="text-[10px] text-muted-foreground">un</span>
                    </div>
                    <Input
                      id="gabarito-fisica"
                      type="number"
                      min="0"
                      step="1"
                      className="h-8 text-sm font-semibold text-foreground"
                      value={customNumFisicas !== null ? customNumFisicas : sugFisicas}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '') {
                          setCustomNumFisicas('');
                        } else {
                          const parsed = parseInt(v, 10);
                          setCustomNumFisicas(isNaN(parsed) ? 0 : Math.max(0, parsed));
                        }
                      }}
                      onBlur={() => {
                        if (customNumFisicas === '') setCustomNumFisicas(0);
                      }}
                    />
                    <div className="text-[10px] text-muted-foreground flex justify-between items-center pt-0.5">
                      {customNumFisicas !== null && customNumFisicas !== sugFisicas ? (
                        <>
                          <span>Sugerido: {sugFisicas}</span>
                          <button
                            type="button"
                            onClick={() => setCustomNumFisicas(null)}
                            className="text-muted-foreground hover:text-foreground underline cursor-pointer"
                          >
                            reverter
                          </button>
                        </>
                      ) : (
                        <span>Textura</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {desconto > 0 && (
              <div className="flex justify-between text-destructive py-1 border-b font-medium">
                <span>DESCONTO DE -{descontoPercentual.toFixed(2)}% (-{soilSamplingService.formatCurrency(descontoPerAlq)}/alq):</span>
                <span>-{soilSamplingService.formatCurrency(desconto)}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b font-bold text-sm text-foreground">
              <span>TOTAL DO PEDIDO:</span>
              <span>{soilSamplingService.formatCurrency(totalValue)} ({soilSamplingService.formatCurrency(totalValuePerAlq)}/alq)</span>
            </div>

            {details.jurosFactor > 1 && (
              <div className="flex justify-between text-muted-foreground pt-1">
                <span>Fator de juros até vencimento (1,5%/mês):</span>
                <span>{details.jurosFactor.toFixed(4)}x</span>
              </div>
            )}

            <div className="pt-2 text-[11px] text-muted-foreground italic border-t">
              OBS: Validade do orçamento: 60 dias
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

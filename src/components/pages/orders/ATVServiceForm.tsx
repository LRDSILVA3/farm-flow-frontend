import React, { useState, useEffect, useMemo } from 'react';
import { ATVService, ATVCalculationResult, ATVItemParam } from '../../../services/ATVService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { useProducts } from '../../../hooks/useProducts';
import { useServices } from '../../../hooks/useServices';
import { Input } from '@/components/ui/input';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Info, Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ATVServiceFormProps {
  initialDistanciaKm?: number;
  initialAreaHa?: number;
  plots?: any[];
  availablePlots?: any[];
  onPlotsChange?: (plots: any[]) => void;
  onAreaChange?: (areaHa: number) => void;
  onValuesChange: (calculatedValue: number) => void;
  onProductsChange?: (products: any[]) => void;
}

const DEFAULT_ATV_PRODUCTS = [
  'Calcário Dolomítico',
  'Calcário Calcítico',
  'Gesso Agrícola',
  'Cama de Frango',
  'Pó de Rocha',
  'KCl (Cloreto de Potássio)',
  'Superfosfato Simples (SSP)',
  'Outro',
];

export const ATVServiceForm: React.FC<ATVServiceFormProps> = ({
  initialDistanciaKm,
  initialAreaHa,
  plots,
  availablePlots,
  onPlotsChange,
  onAreaChange,
  onValuesChange,
  onProductsChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();
  const { products: systemProducts } = useProducts();
  const { services } = useServices();

  const availableProducts = useMemo(() => {
    const atv = services.find((s) => s.name.toLowerCase().includes('atv') || s.name.toLowerCase().includes('taxa variável'));
    if (atv?.service_products && atv.service_products.length > 0) {
      const names = atv.service_products.map((sp) => sp.product?.name).filter(Boolean);
      if (!names.includes('Outro')) names.push('Outro');
      return names;
    }
    if (systemProducts.length > 0) {
      const names = systemProducts.filter((p) => p.status === 'Ativo').map((p) => p.name);
      if (!names.includes('Outro')) names.push('Outro');
      return names;
    }
    return DEFAULT_ATV_PRODUCTS;
  }, [services, systemProducts]);

  const [distanciaIdaKm, setDistanciaIdaKm] = useState<number | null>(initialDistanciaKm || 40);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(undefined);
  const [quantosProdutos, setQuantosProdutos] = useState<number>(1);
  const [quantosCaminhoes, setQuantosCaminhoes] = useState<number>(2);

  // Parâmetros operacionais da planilha INPUT ATV
  const [carregamentoNecessario, setCarregamentoNecessario] = useState<boolean>(true);
  const [comNotaFiscal, setComNotaFiscal] = useState<boolean>(true);
  const [mapaPreciza, setMapaPreciza] = useState<boolean>(true);
  const [clienteAlmoco, setClienteAlmoco] = useState<boolean>(false);
  const [descontoManual, setDescontoManual] = useState<number | null>(null);

  // Inicialização inteligente dos talhões e áreas a partir do pedido
  const [itens, setItens] = useState<ATVItemParam[]>(() => {
    if (plots && plots.length > 0) {
      return plots.map((p: any, idx: number) => {
        const area = parseFloat(p.area || '0') || initialAreaHa || 0;
        const estTon = area > 0 ? Math.round((area / 2.42) * 3.18 * 10) / 10 : 0;
        return {
          produto: 'Calcário Dolomítico',
          idTalhao: p.name || `Talhão ${idx + 1}`,
          areaHa: area,
          toneladas: p.toneladas ? parseFloat(p.toneladas) : estTon,
          cobraFrete: true,
        };
      });
    }
    const defArea = initialAreaHa && initialAreaHa > 0 ? initialAreaHa : 0;
    const estTon = defArea > 0 ? Math.round((defArea / 2.42) * 3.18 * 10) / 10 : 0;
    const defaultTalhaoName = availablePlots && availablePlots.length === 1 ? availablePlots[0].name : '';
    return [
      {
        produto: 'Calcário Dolomítico',
        idTalhao: defaultTalhaoName,
        areaHa: defArea,
        toneladas: estTon,
        cobraFrete: true,
      },
    ];
  });

  const onAreaChangeRef = React.useRef(onAreaChange);
  React.useEffect(() => {
    onAreaChangeRef.current = onAreaChange;
  }, [onAreaChange]);

  const onPlotsChangeRef = React.useRef(onPlotsChange);
  React.useEffect(() => {
    onPlotsChangeRef.current = onPlotsChange;
  }, [onPlotsChange]);

  const onValuesChangeRef = React.useRef(onValuesChange);
  React.useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  const onProductsChangeRef = React.useRef(onProductsChange);
  React.useEffect(() => {
    onProductsChangeRef.current = onProductsChange;
  }, [onProductsChange]);

  // Sincronizar itens quando talhões selecionados mudam
  useEffect(() => {
    if (plots && plots.length > 0) {
      setItens((prev) => {
        const isDefault = prev.length === 1 && (!prev[0].idTalhao || prev[0].areaHa === 0);
        if (!isDefault && prev.length === plots.length) return prev;
        return plots.map((p: any, idx: number) => {
          const area = parseFloat(p.area || '0') || 0;
          const prevItem = prev[idx];
          return {
            produto: prevItem?.produto || 'Calcário Dolomítico',
            idTalhao: p.name || `Talhão ${idx + 1}`,
            areaHa: area > 0 ? area : (prevItem?.areaHa || 0),
            toneladas:
              prevItem?.toneladas && prevItem.toneladas > 0
                ? prevItem.toneladas
                : (area > 0 ? Math.round((area / 2.42) * 3.18 * 10) / 10 : 0),
            cobraFrete: prevItem?.cobraFrete ?? true,
          };
        });
      });
    } else if (initialAreaHa && initialAreaHa > 0) {
      setItens((prev) => {
        if (prev.length === 1 && prev[0].areaHa === 0) {
          return [{
            ...prev[0],
            idTalhao: availablePlots && availablePlots.length === 1 ? availablePlots[0].name : prev[0].idTalhao,
            areaHa: initialAreaHa,
            toneladas: Math.round((initialAreaHa / 2.42) * 3.18 * 10) / 10,
            cobraFrete: true,
          }];
        }
        return prev;
      });
    }
  }, [plots, initialAreaHa, availablePlots]);

  const [calculationResult, setCalculationResult] = useState<ATVCalculationResult | null>(null);

  const atvService = useMemo(() => {
    if (costVariables.length > 0) {
      return new ATVService(costVariables);
    }
    return null;
  }, [costVariables]);

  const handleAddItem = () => {
    const nextPlot = availablePlots && availablePlots.length > itens.length ? availablePlots[itens.length] : null;
    const nextArea = nextPlot?.area ? parseFloat(nextPlot.area) : 0;
    const nextTon = nextArea > 0 ? Math.round((nextArea / 2.42) * 3.18 * 10) / 10 : 0;
    const updated = [
      ...itens,
      {
        produto: availableProducts[0] || 'Calcário Dolomítico',
        idTalhao: nextPlot?.name || '',
        areaHa: nextArea,
        toneladas: nextTon,
        cobraFrete: true,
      },
    ];
    setItens(updated);
    if (nextArea > 0) {
      const totalHa = updated.reduce((sum, it) => sum + (parseFloat(it.areaHa as any) || 0), 0);
      if (onAreaChangeRef.current) {
        onAreaChangeRef.current(totalHa);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    if (itens.length > 1) {
      const updated = itens.filter((_, i) => i !== index);
      setItens(updated);
      const totalHa = updated.reduce((sum, it) => sum + (parseFloat(it.areaHa as any) || 0), 0);
      if (onAreaChangeRef.current) {
        onAreaChangeRef.current(totalHa);
      }
    }
  };

  const handleItemChange = (index: number, field: keyof ATVItemParam, value: any) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };

    // Se selecionou um talhão da fazenda, puxa automaticamente a sua área
    if (field === 'idTalhao' && availablePlots && availablePlots.length > 0) {
      const match = availablePlots.find((p: any) => p.name === value || p.id === value);
      if (match && match.area) {
        const numArea = parseFloat(match.area) || 0;
        if (numArea > 0) {
          newItens[index].areaHa = numArea;
          if (newItens[index].toneladas === 0) {
            newItens[index].toneladas = Math.round((numArea / 2.42) * 3.18 * 10) / 10;
          }
        }
      }
    }

    setItens(newItens);

    // Notificar formulário pai se a área foi alterada
    if (field === 'areaHa' || (field === 'idTalhao' && newItens[index].areaHa > 0)) {
      const totalHa = newItens.reduce((sum, it) => sum + (parseFloat(it.areaHa as any) || 0), 0);
      if (onAreaChangeRef.current) {
        onAreaChangeRef.current(totalHa);
      }
    }

    if (onPlotsChangeRef.current) {
      const mappedPlots = newItens.map((it, i) => ({
        id: `plot_${i + 1}`,
        name: it.idTalhao || `Talhão ${i + 1}`,
        area: it.areaHa,
        produto: it.produto,
        toneladas: it.toneladas,
      }));
      onPlotsChangeRef.current(mappedPlots);
    }
  };

  useEffect(() => {
    if (atvService) {
      const formattedVencimento = vencimentoServico ? format(vencimentoServico, 'dd/MM/yyyy') : undefined;

      const result = atvService.calculate({
        distanciaIdaKm: distanciaIdaKm === null ? 0 : distanciaIdaKm,
        vencimentoServico: formattedVencimento,
        quantosProdutos,
        quantosCaminhoes,
        carregamentoNecessario,
        comNotaFiscal,
        mapaPreciza,
        clienteAlmoco,
        descontoManual: descontoManual === null ? 0 : descontoManual,
        itens,
      });

      setCalculationResult(result);
      if (onValuesChangeRef.current) {
        onValuesChangeRef.current(result.totalValue);
      }

      if (onProductsChangeRef.current && result) {
        const prods: any[] = [];

        // Itens de aplicação ATV e frete detalhados
        result.details.itens.forEach((it, idx) => {
          prods.push({
            id: `atv_app_${idx}`,
            type: 'SERVICO_ATV',
            name: `APLICAÇÃO TAXA VARIÁVEL (ATV) - ${it.produto.toUpperCase()} (${it.idTalhao || 'Talhão'})`,
            produto: it.produto,
            plotName: it.idTalhao,
            quantity: it.areaAlq > 0 ? it.areaAlq : (it.areaHa > 0 ? Number((it.areaHa / 2.42).toFixed(2)) : it.toneladas),
            unit: it.areaHa > 0 ? 'ALQ' : 'TON',
            price: it.areaAlq > 0 ? Number((it.investimentoATV / it.areaAlq).toFixed(2)) : it.investimentoATV,
            totalPrice: it.investimentoATV,
            areaHa: it.areaHa,
            toneladas: it.toneladas,
          });

          if (it.investimentoFrete > 0) {
            prods.push({
              id: `atv_frete_${idx}`,
              type: 'FRETE_INSUMO',
              name: `FRETE DE INSUMO (${it.produto}) - ${it.cargas} CARGA(S) [${it.toneladas} TON]`,
              quantity: it.cargas,
              unit: 'CARGA',
              price: Number((it.investimentoFrete / it.cargas).toFixed(2)),
              totalPrice: it.investimentoFrete,
            });
          }
        });

        // Carregamento com pá carregadeira e prancha
        if (result.custoCarregamento > 0) {
          prods.push({
            id: 'atv_carregamento',
            type: 'CARREGAMENTO_PA',
            name: `CARREGAMENTO (${result.diasServico} DIÁRIA(S) PÁ CARREGADEIRA + PRANCHA)`,
            quantity: result.diasServico,
            unit: 'DIÁRIA',
            price: result.custoCarregamento / result.diasServico,
            totalPrice: result.custoCarregamento,
          });
        }

        // Deslocamento vazio excedente se aplicável
        if (result.adicionalDeslocamento > 0) {
          prods.push({
            id: 'atv_deslocamento_vazio',
            type: 'DESLOCAMENTO_VAZIO',
            name: `ADICIONAL DE DESLOCAMENTO VAZIO (>20%)`,
            quantity: 1,
            unit: 'SV',
            price: result.adicionalDeslocamento,
            totalPrice: result.adicionalDeslocamento,
          });
        }

        onProductsChangeRef.current(prods);
      }
    }
  }, [
    distanciaIdaKm,
    vencimentoServico,
    quantosProdutos,
    quantosCaminhoes,
    carregamentoNecessario,
    comNotaFiscal,
    mapaPreciza,
    clienteAlmoco,
    descontoManual,
    itens,
    atvService,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!atvService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const totalValue = calculationResult?.totalValue ?? 0;
  const subtotalATV = calculationResult?.subtotalATV ?? 0;
  const custoCarregamento = calculationResult?.custoCarregamento ?? 0;
  const precoPorAlqueire = calculationResult?.precoPorAlqueire ?? 0;
  const precoPorTonelada = calculationResult?.precoPorTonelada ?? 0;
  const precoPorCarga = calculationResult?.precoPorCarga ?? 0;
  const diasServico = calculationResult?.diasServico ?? 1;
  const details = calculationResult?.details;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cálculo de Aplicação em Taxa Variável (ATV)</h3>
        
      </div>

      <div className="space-y-4">
        {/* Parametrização Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="atv-distancia">Deslocamento até a área - Km (ida):</Label>
            <Input
              id="atv-distancia"
              type="number"
              value={distanciaIdaKm === null ? '' : distanciaIdaKm}
              onChange={(e) => {
                const value = e.target.value;
                setDistanciaIdaKm(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 40"
            />
          </div>

          <div>
            <Label htmlFor="atv-vencimento">Vencimento do serviço (opcional):</Label>
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
                  {vencimentoServico ? format(vencimentoServico, "PPP", { locale: ptBR }) : <span>À Vista (Sem acréscimo)</span>}
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
            <Label htmlFor="atv-quantos-produtos">Número de produtos no pacote:</Label>
            <Select
              value={quantosProdutos.toString()}
              onValueChange={(val) => setQuantosProdutos(parseInt(val))}
            >
              <SelectTrigger id="atv-quantos-produtos">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  1 Produto ({atvService ? atvService.formatCurrency(atvService.getVariableValue('ATV_1_PRODUTO') || 315) : 'R$ 315,00'}/alq)
                </SelectItem>
                <SelectItem value="2">
                  2 Produtos ({atvService ? atvService.formatCurrency(atvService.getVariableValue('ATV_2_PRODUTOS') || 310) : 'R$ 310,00'}/alq)
                </SelectItem>
                <SelectItem value="3">
                  3 ou Mais Produtos ({atvService ? atvService.formatCurrency(atvService.getVariableValue('ATV_3_PRODUTOS') || 300) : 'R$ 300,00'}/alq)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles operacionais */}
        <div className="p-3 border rounded-md bg-muted/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="atv-carregamento"
              checked={carregamentoNecessario}
              onCheckedChange={setCarregamentoNecessario}
            />
            <Label htmlFor="atv-carregamento" className="text-xs cursor-pointer">
              Carregamento Pá Carregadeira?
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="atv-nf"
              checked={comNotaFiscal}
              onCheckedChange={setComNotaFiscal}
            />
            <Label htmlFor="atv-nf" className="text-xs cursor-pointer">
              Serviço com Nota Fiscal?
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="atv-mapa"
              checked={mapaPreciza}
              onCheckedChange={setMapaPreciza}
            />
            <Label htmlFor="atv-mapa" className="text-xs cursor-pointer">
              Mapa de Origem Preciza?
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="atv-almoco"
              checked={clienteAlmoco}
              onCheckedChange={setClienteAlmoco}
            />
            <Label htmlFor="atv-almoco" className="text-xs cursor-pointer">
              Cliente providencia almoço?
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="atv-caminhoes">Caminhões para aplicar:</Label>
            <Input
              id="atv-caminhoes"
              type="number"
              value={quantosCaminhoes}
              onChange={(e) => setQuantosCaminhoes(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="atv-desconto">Desconto Manual (R$):</Label>
            <Input
              id="atv-desconto"
              type="number" step="any"
              value={descontoManual === null ? '' : descontoManual}
              onChange={(e) => {
                const value = e.target.value;
                setDescontoManual(value === '' ? null : parseFloat(value));
              }}
              min="0"
              placeholder="Ex: 111.19"
            />
          </div>
        </div>

        {/* Product Items Table */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <div>
              <Label className="font-semibold">Produtos e Talhões:</Label>
              <span className="text-xs text-muted-foreground ml-2">
                Selecione o talhão da fazenda ou informe a área desejada
              </span>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Produto/Talhão
            </Button>
          </div>

          <div className="space-y-3">
            {itens.map((item, idx) => {
              const itemAlq = (item.areaHa || 0) > 0 ? (item.areaHa / 2.42).toFixed(2) : '0.00';
              const doseTonHa = item.areaHa > 0 && item.toneladas > 0 ? (item.toneladas / item.areaHa).toFixed(1) : null;
              const cargasCalc = Math.ceil(item.toneladas / 13);
              return (
                <div key={idx} className="p-3 border rounded-md bg-muted/30 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-3">
                    <Label className="text-xs">Produto</Label>
                    <Select
                      value={item.produto}
                      onValueChange={(val) => handleItemChange(idx, 'produto', val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((prod) => (
                          <SelectItem key={prod} value={prod}>
                            {prod}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3">
                    <Label className="text-xs">Talhão</Label>
                    {availablePlots && availablePlots.length > 0 ? (
                      <div className="space-y-1">
                        <Select
                          value={availablePlots.some(p => p.name === item.idTalhao) ? item.idTalhao : '__custom__'}
                          onValueChange={(val) => {
                            if (val !== '__custom__') {
                              handleItemChange(idx, 'idTalhao', val);
                            }
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Selecione o talhão" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlots.map((plot: any) => (
                              <SelectItem key={plot.id || plot.name} value={plot.name}>
                                {plot.name} ({plot.area ? `${plot.area} ha` : ''})
                              </SelectItem>
                            ))}
                            <SelectItem value="__custom__">Outro / Digitar livremente...</SelectItem>
                          </SelectContent>
                        </Select>
                        {(!availablePlots.some(p => p.name === item.idTalhao)) && (
                          <Input
                            type="text"
                            value={item.idTalhao || ''}
                            onChange={(e) => handleItemChange(idx, 'idTalhao', e.target.value)}
                            placeholder="Nome do talhão (ex: aeroporto)"
                            className="h-8 text-xs mt-1"
                          />
                        )}
                      </div>
                    ) : (
                      <Input
                        type="text"
                        value={item.idTalhao || ''}
                        onChange={(e) => handleItemChange(idx, 'idTalhao', e.target.value)}
                        placeholder="Nome do talhão (ex: aeroporto)"
                        className="h-9 text-xs"
                      />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Área (ha)</Label>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {itemAlq} alq
                      </span>
                    </div>
                    <DecimalInput
                      value={item.areaHa}
                      onValueChange={(newHa) => handleItemChange(idx, 'areaHa', newHa ?? 0)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Toneladas (Ton)</Label>
                      {doseTonHa && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {doseTonHa} t/ha
                        </span>
                      )}
                    </div>
                    <Input
                      type="number"
                      value={item.toneladas === 0 ? '' : item.toneladas}
                      onChange={(e) => handleItemChange(idx, 'toneladas', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="any"
                      placeholder="Ex: 63.6"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="md:col-span-1 flex flex-col justify-end pb-1">
                    <div className="flex items-center space-x-1.5">
                      <Switch
                        id={"frete-" + idx}
                        checked={item.cobraFrete}
                        onCheckedChange={(checked) => handleItemChange(idx, 'cobraFrete', checked)}
                      />
                      <Label htmlFor={"frete-" + idx} className="text-xs cursor-pointer font-medium">Frete?</Label>
                    </div>
                    {item.cobraFrete && item.toneladas > 0 && (
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {cargasCalc} carga{cargasCalc > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-1 flex justify-end pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={itens.length <= 1}
                      title="Remover linha"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t space-y-3">
        <h4 className="text-md font-semibold">Valores Calculados:</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor Total do Pedido</span>
            <strong className="text-lg text-primary">{atvService.formatCurrency(totalValue)}</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Alqueire</span>
            <strong className="text-lg">{atvService.formatCurrency(precoPorAlqueire)}/ALQ</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Tonelada</span>
            <strong className="text-lg">{atvService.formatCurrency(precoPorTonelada)}/TON</strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Carga</span>
            <strong className="text-lg">{atvService.formatCurrency(precoPorCarga)}/CARGA</strong>
          </div>
        </div>

        {details && (
          <div className="mt-4 p-3 border rounded-md text-xs space-y-1.5 bg-muted/20">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição do Orçamento:</div>

            {custoCarregamento > 0 && (
              <div className="flex justify-between py-1 border-b">
                <span>Carregamento ({diasServico} diária(s) Pá Carregadeira + Prancha {(distanciaIdaKm || 0) * 4} Km desloc.):</span>
                <span className="font-medium">{atvService.formatCurrency(custoCarregamento)}</span>
              </div>
            )}

            {details.itens.map((it, i) => (
              <div key={i} className="flex justify-between py-1 border-b">
                <span>
                  Serviço Aplic. <strong>{it.produto}</strong> - {it.toneladas} TON {it.idTalhao ? '- ' + it.idTalhao : ''} ({it.areaAlq} alq):
                </span>
                <span className="font-medium">
                  {atvService.formatCurrency(it.investimentoATV)} ({atvService.formatCurrency(it.precoUnitarioAlq)}/alq)
                </span>
              </div>
            ))}

            {calculationResult?.descontoManual && calculationResult.descontoManual > 0 ? (
              <div className="flex justify-between text-destructive py-1 border-b">
                <span>Desconto concedido:</span>
                <span>-{atvService.formatCurrency(calculationResult.descontoManual)}</span>
              </div>
            ) : null}

            {details.jurosFactor > 1 && (
              <div className="flex justify-between text-muted-foreground pt-1">
                <span>Fator de juros até vencimento (1,2%/mês):</span>
                <span>{details.jurosFactor.toFixed(4)}x</span>
              </div>
            )}

            {calculationResult?.descontoNF && calculationResult.descontoNF > 0 ? (
              <div className="flex justify-between text-destructive py-1 border-b">
                <span>Desconto sem Nota Fiscal (4%):</span>
                <span>-{atvService.formatCurrency(calculationResult.descontoNF)}</span>
              </div>
            ) : null}

            {((calculationResult?.subtotalFrete || 0) > 0 || (calculationResult?.adicionalDeslocamento || 0) > 0) && (
              <div className="flex justify-between py-1 border-b">
                <span>Frete ({calculationResult?.totalToneladas} TON / {calculationResult?.totalCargas} Cargas):</span>
                <span>{atvService.formatCurrency((calculationResult?.subtotalFrete || 0) + (calculationResult?.adicionalDeslocamento || 0))}</span>
              </div>
            )}

            <div className="pt-2 text-muted-foreground flex flex-col sm:flex-row sm:justify-between gap-1 text-[11px] font-mono border-t">
              <span>
                {calculationResult?.totalAreaAlq.toFixed(1)}Alq/{calculationResult?.totalToneladas.toFixed(0)}Ton (R$/Alq = {precoPorAlqueire.toFixed(2)} - R$/CARGA = {precoPorCarga.toFixed(1)})
              </span>
              <span className="font-semibold">R$ {precoPorTonelada.toFixed(2)}/Ton</span>
            </div>

            <div className="pt-1 text-[11px] text-muted-foreground italic">
              OBS: Cliente {clienteAlmoco ? 'providencia almoço' : 'NÃO providencia almoço'} // Mapa origem {mapaPreciza ? 'Preciza' : 'NÃO Preciza'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

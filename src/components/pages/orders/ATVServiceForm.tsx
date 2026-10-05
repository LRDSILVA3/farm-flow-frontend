import React, { useState, useEffect, useMemo } from 'react';
import { ATVService, ATVCalculationResult, ATVItemParam } from '../../../services/ATVService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
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
  initialDistanciaKm: number;
  onValuesChange: (calculatedValue: number) => void;
}

const AVAILABLE_PRODUCTS = [
  'Calc. Dolomítico',
  'Calc. Calcítico',
  'Gesso',
  'Cama de Frango',
  'Pó de Rocha',
  'KCl',
  'Outro',
];

export const ATVServiceForm: React.FC<ATVServiceFormProps> = ({
  initialDistanciaKm,
  onValuesChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [distanciaIdaKm, setDistanciaIdaKm] = useState<number | null>(initialDistanciaKm || 40);
  const [vencimentoServico, setVencimentoServico] = useState<Date | undefined>(undefined);
  const [quantosProdutos, setQuantosProdutos] = useState<number>(3);
  const [quantosCaminhoes, setQuantosCaminhoes] = useState<number>(2);

  // Parâmetros operacionais da planilha INPUT ATV
  const [carregamentoNecessario, setCarregamentoNecessario] = useState<boolean>(true);
  const [comNotaFiscal, setComNotaFiscal] = useState<boolean>(true);
  const [mapaPreciza, setMapaPreciza] = useState<boolean>(true);
  const [clienteAlmoco, setClienteAlmoco] = useState<boolean>(false);
  const [descontoManual, setDescontoManual] = useState<number | null>(null);

  const [itens, setItens] = useState<ATVItemParam[]>([
    {
      produto: 'Calc. Dolomítico',
      idTalhao: 'TL44',
      areaHa: 72,
      toneladas: 20,
      cobraFrete: false,
    },
  ]);

  const [calculationResult, setCalculationResult] = useState<ATVCalculationResult | null>(null);

  const atvService = useMemo(() => {
    if (costVariables.length > 0) {
      return new ATVService(costVariables);
    }
    return null;
  }, [costVariables]);

  const handleAddItem = () => {
    setItens([
      ...itens,
      {
        produto: 'Calc. Dolomítico',
        idTalhao: '',
        areaHa: 0,
        toneladas: 0,
        cobraFrete: false,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof ATVItemParam, value: any) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setItens(newItens);
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
      onValuesChange(result.totalValue);
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
    onValuesChange,
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
                <SelectItem value="1">1 Produto (R$ 290/alq)</SelectItem>
                <SelectItem value="2">2 Produtos (R$ 280/alq)</SelectItem>
                <SelectItem value="3">3 ou Mais Produtos (R$ 260/alq)</SelectItem>
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
            <Label className="font-semibold">Produtos e Talhões:</Label>
            <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Produto/Talhão
            </Button>
          </div>

          <div className="space-y-3">
            {itens.map((item, idx) => (
              <div key={idx} className="p-3 border rounded-md bg-muted/30 grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
                <div className="md:col-span-2">
                  <Label className="text-xs">Produto</Label>
                  <Select
                    value={item.produto}
                    onValueChange={(val) => handleItemChange(idx, 'produto', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_PRODUCTS.map((prod) => (
                        <SelectItem key={prod} value={prod}>
                          {prod}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Talhão</Label>
                  <Input
                    type="text"
                    value={item.idTalhao || ''}
                    onChange={(e) => handleItemChange(idx, 'idTalhao', e.target.value)}
                    placeholder="Ex: TL44"
                  />
                </div>

                <div>
                  <Label className="text-xs">Área (ha)</Label>
                  <Input
                    type="number"
                    value={item.areaHa}
                    onChange={(e) => handleItemChange(idx, 'areaHa', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Toneladas (Ton)</Label>
                  <Input
                    type="number"
                    value={item.toneladas}
                    onChange={(e) => handleItemChange(idx, 'toneladas', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.5"
                  />
                </div>

                <div className="flex items-center space-x-2 pb-2">
                  <Switch
                    id={"frete-" + idx}
                    checked={item.cobraFrete}
                    onCheckedChange={(checked) => handleItemChange(idx, 'cobraFrete', checked)}
                  />
                  <Label htmlFor={"frete-" + idx} className="text-xs cursor-pointer">Frete?</Label>
                </div>

                <div className="flex justify-end pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={itens.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
                <span>Fator de juros até vencimento (1,5%/mês):</span>
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

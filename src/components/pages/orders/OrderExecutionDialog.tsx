import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order, OrderExecutionSplit } from '@/hooks/useOrders';
import { Play, CheckCircle2, History, Users, Wrench, X, FlaskConical, Tractor, Plus, Trash2, MapPin } from 'lucide-react';
import { api } from '@/services/api';

interface OrderExecutionDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordExecution: (orderId: string, execution: {
    areaExecuted: number;
    samplesExecuted?: number;
    samplesTotal?: number;
    splits?: OrderExecutionSplit[];
    appliedProducts?: Array<{ id?: string; name: string; quantity?: number; unit?: string }>;
    notes?: string;
    collaboratorName?: string;
    collaborators?: string[];
    equipmentNames?: string[];
  }) => Promise<void>;
}

const DEFAULT_ATV_PRODUCTS = [
  'Calc. Dolomítico',
  'Calc. Calcítico',
  'Gesso',
  'Cama de Frango',
  'Pó de Rocha',
  'KCl',
  'Super Simples',
  'Super Triplo',
  'Outro',
];

export const OrderExecutionDialog: React.FC<OrderExecutionDialogProps> = ({
  order,
  open,
  onOpenChange,
  onRecordExecution,
}) => {
  const [executionType, setExecutionType] = useState<'total' | 'partial'>('total');
  const [partialArea, setPartialArea] = useState<string>('');
  const [stepSamples, setStepSamples] = useState<string>('');
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Rateios específicos de operador, máquina e produto (Pilar 3: ATV e Aplicações)
  const [splits, setSplits] = useState<OrderExecutionSplit[]>([]);
  const [splitOperator, setSplitOperator] = useState<string>('');
  const [splitEquipment, setSplitEquipment] = useState<string>('');
  const [splitProduct, setSplitProduct] = useState<string>('');
  const [splitPlot, setSplitPlot] = useState<string>('');
  const [splitQuantity, setSplitQuantity] = useState<string>('');
  const [splitUnit, setSplitUnit] = useState<string>('Ton');
  const [splitArea, setSplitArea] = useState<string>('');

  const [collaboratorsList, setCollaboratorsList] = useState<{ id: string; name: string; role?: string }[]>([]);
  const [equipmentList, setEquipmentList] = useState<{ id: string; name: string; type?: string }[]>([]);

  useEffect(() => {
    if (open) {
      fetchOptions();
      // Reseta formulário ao abrir
      setSplits([]);
      setSplitQuantity('');
      setSplitArea('');
      setNotes('');
      setStepSamples('');
      setSelectedCollaborators([]);
      setSelectedEquipment([]);
      setExecutionType('total');
    }
  }, [open, order]);

  const fetchOptions = async () => {
    try {
      const [collabs, equips] = await Promise.all([
        api.get<any[]>('/collaborators').catch(() => []),
        api.get<any[]>('/equipment').catch(() => [])
      ]);
      if (Array.isArray(collabs)) setCollaboratorsList(collabs);
      if (Array.isArray(equips)) setEquipmentList(equips);
    } catch {}
  };

  // Identificação do Tipo de Serviço
  const serviceCombined = useMemo(() => {
    if (!order) return '';
    return `${order.serviceName || ''} ${order.type || ''} ${order.serviceGroup || ''}`.toLowerCase();
  }, [order]);

  const isSamplingService = useMemo(() => {
    return (
      serviceCombined.includes('amostr') ||
      serviceCombined.includes('solo') ||
      serviceCombined.includes('ap') ||
      serviceCombined.includes('confer') ||
      serviceCombined.includes('folha') ||
      serviceCombined.includes('foliar') ||
      serviceCombined.includes('compacta')
    );
  }, [serviceCombined]);

  const isApplicationService = useMemo(() => {
    return (
      serviceCombined.includes('atv') ||
      serviceCombined.includes('pulveriz') ||
      serviceCombined.includes('aplica') ||
      serviceCombined.includes('biol') ||
      order?.type === 'Produto'
    );
  }, [serviceCombined, order?.type]);

  // Total e Saldo de Análises Contratadas (Pilar 2)
  const totalSamples = useMemo(() => {
    if (!order) return 0;
    if (typeof order.totalSamples === 'number' && order.totalSamples > 0) {
      return order.totalSamples;
    }
    if (!Array.isArray(order.productsData) || order.productsData.length === 0) {
      return 0;
    }
    const analysisKeys = [
      'analises_completa',
      'analises_macro',
      'analises_macro_prem',
      'analises_20_40',
      'analise_fisica',
      'analise_foliar',
      'pontos',
      'analises_inclusas'
    ];
    const match = order.productsData.filter(
      (p: any) =>
        analysisKeys.includes(p.id) ||
        p.unit === 'PTOS' ||
        (p.name && /análise|analise|ponto/i.test(p.name))
    );
    if (match.length === 0) return 0;
    return match.reduce((sum: number, p: any) => sum + (Number(p.quantity) || 0), 0);
  }, [order]);

  const executedSamples = useMemo(() => {
    if (!order) return 0;
    if (typeof order.executedSamples === 'number' && order.executedSamples > 0) {
      return order.executedSamples;
    }
    return (order.executions || []).reduce(
      (sum, e) => sum + (Number(e.samplesExecuted) || 0),
      0
    );
  }, [order]);

  const remainingSamples = Math.max(0, totalSamples - executedSamples);
  const percentSamples = totalSamples > 0 ? (executedSamples / totalSamples) * 100 : 0;

  // Produtos disponíveis no pedido para rateio de ATV/Aplicação
  const availableOrderProducts = useMemo(() => {
    if (!order) return DEFAULT_ATV_PRODUCTS;
    const found: string[] = [];
    if (Array.isArray(order.productsData)) {
      order.productsData.forEach((p: any) => {
        if (p.name && !p.name.includes('SERVIÇO') && !p.id?.startsWith('servico_') && p.unit !== 'ALQ') {
          found.push(p.name);
        }
        if (p.produto && typeof p.produto === 'string') {
          found.push(p.produto);
        }
      });
    }
    if (found.length === 0) {
      return DEFAULT_ATV_PRODUCTS;
    }
    // Adiciona produtos padrão de ATV caso queira aplicar outro
    return Array.from(new Set([...found, ...DEFAULT_ATV_PRODUCTS]));
  }, [order]);

  // Talhões disponíveis no pedido
  const availablePlots = useMemo(() => {
    if (!order) return [];
    if (Array.isArray(order.plots) && order.plots.length > 0) {
      return order.plots;
    }
    return [];
  }, [order]);

  // Inicializa selects de rateio
  useEffect(() => {
    if (collaboratorsList.length > 0 && !splitOperator) {
      setSplitOperator(collaboratorsList[0].name);
    }
    if (equipmentList.length > 0 && !splitEquipment) {
      setSplitEquipment(equipmentList[0].name);
    }
    if (availableOrderProducts.length > 0 && !splitProduct) {
      setSplitProduct(availableOrderProducts[0]);
    }
    if (availablePlots.length > 0 && !splitPlot) {
      setSplitPlot(availablePlots[0].name);
    }
  }, [collaboratorsList, equipmentList, availableOrderProducts, availablePlots, splitOperator, splitEquipment, splitProduct, splitPlot]);

  // Subtotais de rateio por produto (Hook declarado no topo para respeitar as regras do React)
  const splitProductTotals = useMemo(() => {
    const map = new Map<string, { totalQty: number; unit: string; totalArea: number }>();
    splits.forEach(s => {
      const prod = s.productName || 'Produto';
      const cur = map.get(prod) || { totalQty: 0, unit: s.unit || 'Ton', totalArea: 0 };
      cur.totalQty += s.quantity || 0;
      cur.totalArea += s.areaHa || 0;
      map.set(prod, cur);
    });
    return Array.from(map.entries());
  }, [splits]);

  if (!order) return null;

  const totalArea = parseFloat(order.area) || 0;
  const executedArea = order.executedArea || 0;
  const remainingArea = Math.max(0, totalArea - executedArea);
  const percentExecuted = totalArea > 0 ? (executedArea / totalArea) * 100 : 0;

  const toggleCollaborator = (name: string) => {
    setSelectedCollaborators(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const toggleEquipment = (name: string) => {
    setSelectedEquipment(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    );
  };

  // Adiciona linha de rateio do ATV (Operador + Máquina + Produto + Talhão + Qtd + Área)
  const handleAddSplit = () => {
    const areaNum = parseFloat(splitArea) || 0;
    const qtdNum = parseFloat(splitQuantity) || 0;

    if (!splitOperator || !splitProduct || (areaNum <= 0 && qtdNum <= 0)) {
      return;
    }

    const newSplit: OrderExecutionSplit = {
      id: String(Date.now()),
      collaboratorName: splitOperator,
      equipmentName: splitEquipment || 'Quadriciclo ATV',
      productName: splitProduct,
      plotName: splitPlot || undefined,
      quantity: qtdNum > 0 ? qtdNum : undefined,
      unit: splitUnit,
      areaHa: areaNum,
    };

    const nextSplits = [...splits, newSplit];
    setSplits(nextSplits);

    // Soma as áreas dos splits para preencher a área parcial automaticamente
    const totalSplitsArea = nextSplits.reduce((acc, s) => acc + (s.areaHa || 0), 0);
    if (totalSplitsArea > 0) {
      setPartialArea(totalSplitsArea.toFixed(2));
      setExecutionType('partial');
    }

    // Mantém colaboradores e equipamentos da equipe marcados
    if (!selectedCollaborators.includes(splitOperator)) {
      setSelectedCollaborators(prev => [...prev, splitOperator]);
    }
    if (splitEquipment && !selectedEquipment.includes(splitEquipment)) {
      setSelectedEquipment(prev => [...prev, splitEquipment]);
    }

    // Limpa campos para a próxima linha
    setSplitQuantity('');
    setSplitArea('');
  };

  const handleRemoveSplit = (splitId: string) => {
    const nextSplits = splits.filter(s => s.id !== splitId);
    setSplits(nextSplits);
    const totalSplitsArea = nextSplits.reduce((acc, s) => acc + (s.areaHa || 0), 0);
    if (totalSplitsArea > 0) {
      setPartialArea(totalSplitsArea.toFixed(2));
    }
  };

  const handleConfirm = async () => {
    let areaToExecute = 0;
    if (executionType === 'total') {
      areaToExecute = remainingArea;
    } else {
      areaToExecute = parseFloat(partialArea) || 0;
    }

    if (areaToExecute <= 0 && remainingArea > 0) return;

    // Análises realizadas nesta etapa
    let samplesToExecute: number | undefined = undefined;
    if (totalSamples > 0) {
      if (executionType === 'total') {
        samplesToExecute = remainingSamples;
      } else {
        const val = parseInt(stepSamples, 10);
        samplesToExecute = !isNaN(val) && val > 0 ? val : undefined;
      }
    }

    setSubmitting(true);
    try {
      await onRecordExecution(order.id, {
        areaExecuted: areaToExecute,
        samplesExecuted: samplesToExecute,
        samplesTotal: totalSamples > 0 ? totalSamples : undefined,
        splits: splits.length > 0 ? splits : undefined,
        collaborators: selectedCollaborators,
        collaboratorName: selectedCollaborators.join(', ') || undefined,
        equipmentNames: selectedEquipment,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Play className="h-5 w-5 text-primary" />
            Registrar Execução de Serviço
          </DialogTitle>
          <DialogDescription className="sr-only">
            Registrar apontamento de execução por operador, talhão, análises e produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="p-3 border rounded-md bg-muted/30 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente / Fazenda:</span>
              <span className="font-semibold">{order.client?.name || order.clientId} • {order.farm?.name || order.farmId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço:</span>
              <span className="font-semibold">{order.serviceName || order.type}</span>
            </div>

            {/* Talhões do Pedido (Pilar 1) */}
            {availablePlots.length > 0 && (
              <div className="flex justify-between items-start border-t pt-1.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  Talhões do Pedido:
                </span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                  {availablePlots.map((p: any) => (
                    <Badge key={p.id} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                      {p.name} ({parseFloat(p.area || "0").toFixed(1)} ha)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Progresso de Área */}
            <div className="border-t pt-1.5 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Área Contratada:</span>
                <strong>{totalArea.toFixed(1)} ha</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Área Já Executada:</span>
                <strong className="text-primary">{executedArea.toFixed(1)} ha ({percentExecuted.toFixed(1)}%)</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Saldo a Executar:</span>
                <strong className="text-amber-600">{remainingArea.toFixed(1)} ha</strong>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: Math.min(100, percentExecuted) + '%' }}
                />
              </div>
            </div>

            {/* Progresso de Análises / Pontos (Pilar 2) */}
            {totalSamples > 0 && (
              <div className="border-t pt-1.5 space-y-1 bg-emerald-50/50 p-2 rounded border border-emerald-100">
                <div className="flex justify-between items-center text-xs text-emerald-950">
                  <span className="font-semibold flex items-center gap-1">
                    <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
                    Controle de Análises / Amostras de Solo:
                  </span>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">
                    {executedSamples} / {totalSamples} Realizadas ({percentSamples.toFixed(0)}%)
                  </Badge>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-800">
                  <span>Saldo Restante a Coletar:</span>
                  <strong>{remainingSamples} análises / pontos</strong>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-1.5 mt-0.5">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all"
                    style={{ width: Math.min(100, percentSamples) + '%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {remainingArea <= 0 && (!totalSamples || remainingSamples <= 0) ? (
            <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-md text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Este serviço já foi 100% executado e concluído!
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tipo de Execução */}
              <div className="space-y-2">
                <Label className="font-semibold text-xs">Tipo de Execução nesta Etapa:</Label>
                <RadioGroup
                  value={executionType}
                  onValueChange={(v) => setExecutionType(v as 'total' | 'partial')}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded p-2.5 cursor-pointer hover:bg-muted/20">
                    <RadioGroupItem value="total" id="exec-total" />
                    <Label htmlFor="exec-total" className="text-xs cursor-pointer">
                      Executar 100% ({remainingArea.toFixed(1)} ha restantes{totalSamples > 0 ? ` • ${remainingSamples} análises` : ''})
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded p-2.5 cursor-pointer hover:bg-muted/20">
                    <RadioGroupItem value="partial" id="exec-partial" />
                    <Label htmlFor="exec-partial" className="text-xs cursor-pointer font-semibold">
                      Execução Parcial
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Campos de Execução Parcial: Área e Análises (Pilar 2) */}
              {executionType === 'partial' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded-md bg-muted/20">
                  <div>
                    <Label htmlFor="partial-area" className="text-xs font-semibold">
                      Área Executada nesta Etapa (ha):
                    </Label>
                    <DecimalInput
                      id="partial-area"
                      value={partialArea}
                      onValueChange={(_, normalized) => setPartialArea(normalized)}
                      placeholder={'Máximo: ' + remainingArea.toFixed(1).replace('.', ',') + ' ha'}
                    />
                  </div>

                  {totalSamples > 0 && (
                    <div>
                      <Label htmlFor="step-samples" className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        <FlaskConical className="h-3 w-3" />
                        Análises / Pontos Realizados (nesta Etapa):
                      </Label>
                      <Input
                        id="step-samples"
                        type="number"
                        min="0"
                        max={remainingSamples}
                        value={stepSamples}
                        onChange={(e) => setStepSamples(e.target.value)}
                        placeholder={`Ex: 3 (Restam ${remainingSamples} de ${totalSamples})`}
                        className="text-xs h-9 bg-background"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* PILAR 3: RATEIO ATV & APLICAÇÕES POR OPERADOR, PRODUTO E QUANTIDADE */}
              {isApplicationService && (
                <div className="p-3 border rounded-md bg-amber-50/40 border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Tractor className="h-4 w-4 text-amber-600" />
                      Rateio de Aplicação: Operador, Produto e Quantidade
                    </Label>
                    <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-amber-300">
                      {splits.length} {splits.length === 1 ? 'linha adicionada' : 'linhas adicionadas'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[11px]">Operador</Label>
                      <Select value={splitOperator} onValueChange={setSplitOperator}>
                        <SelectTrigger className="h-8 text-xs bg-card">
                          <SelectValue placeholder="Operador..." />
                        </SelectTrigger>
                        <SelectContent>
                          {collaboratorsList.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px]">Equipamento</Label>
                      <Select value={splitEquipment} onValueChange={setSplitEquipment}>
                        <SelectTrigger className="h-8 text-xs bg-card">
                          <SelectValue placeholder="Máquina..." />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentList.map(eq => (
                            <SelectItem key={eq.id} value={eq.name}>{eq.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px]">Produto Aplicado</Label>
                      <Select value={splitProduct} onValueChange={setSplitProduct}>
                        <SelectTrigger className="h-8 text-xs bg-card">
                          <SelectValue placeholder="Produto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOrderProducts.map((p, i) => (
                            <SelectItem key={i} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {availablePlots.length > 0 && (
                      <div>
                        <Label className="text-[11px]">Talhão</Label>
                        <Select value={splitPlot} onValueChange={setSplitPlot}>
                          <SelectTrigger className="h-8 text-xs bg-card">
                            <SelectValue placeholder="Talhão..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlots.map((p: any) => (
                              <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label className="text-[11px]">Qtd Aplicada</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="any"
                          placeholder="Ex: 18"
                          value={splitQuantity}
                          onChange={(e) => setSplitQuantity(e.target.value)}
                          className="h-8 text-xs bg-card"
                        />
                        <Select value={splitUnit} onValueChange={setSplitUnit}>
                          <SelectTrigger className="h-8 text-xs w-16 bg-card shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ton">Ton</SelectItem>
                            <SelectItem value="Kg">Kg</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[11px]">Área (ha)</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ex: 45"
                        value={splitArea}
                        onChange={(e) => setSplitArea(e.target.value)}
                        className="h-8 text-xs bg-card"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddSplit}
                    className="w-full h-8 text-xs bg-amber-100/60 hover:bg-amber-200/80 text-amber-900 border-amber-300 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1 text-amber-700" />
                    Adicionar Apontamento deste Operador
                  </Button>

                  {/* Tabela dos Splits Adicionados */}
                  {splits.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="border rounded bg-card overflow-hidden">
                        <Table className="text-xs">
                          <TableHeader className="bg-muted/40">
                            <TableRow className="h-7">
                              <TableHead className="py-1 px-2">Operador</TableHead>
                              <TableHead className="py-1 px-2">Máquina</TableHead>
                              <TableHead className="py-1 px-2">Produto</TableHead>
                              <TableHead className="py-1 px-2">Talhão</TableHead>
                              <TableHead className="py-1 px-2">Qtd</TableHead>
                              <TableHead className="py-1 px-2">Área</TableHead>
                              <TableHead className="py-1 px-1 text-right"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {splits.map((s) => (
                              <TableRow key={s.id} className="h-8">
                                <TableCell className="py-1 px-2 font-medium">{s.collaboratorName}</TableCell>
                                <TableCell className="py-1 px-2 text-muted-foreground">{s.equipmentName}</TableCell>
                                <TableCell className="py-1 px-2 font-semibold text-amber-900">{s.productName}</TableCell>
                                <TableCell className="py-1 px-2 text-muted-foreground">{s.plotName || '-'}</TableCell>
                                <TableCell className="py-1 px-2 font-semibold">{s.quantity ? `${s.quantity} ${s.unit}` : '-'}</TableCell>
                                <TableCell className="py-1 px-2 font-medium">{s.areaHa} ha</TableCell>
                                <TableCell className="py-1 px-1 text-right">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoveSplit(s.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Subtotais Consolidados por Produto */}
                      <div className="p-2 bg-amber-100/40 rounded border border-amber-200 text-[11px] text-amber-950 flex flex-wrap gap-x-4 gap-y-1 justify-between">
                        <span className="font-semibold">Subtotal Aplicado nesta Etapa:</span>
                        <div className="flex flex-wrap gap-2">
                          {splitProductTotals.map(([prod, data]) => (
                            <span key={prod} className="font-medium bg-card px-1.5 py-0.5 rounded border border-amber-200">
                              {prod}: <strong>{data.totalQty.toFixed(1)} {data.unit}</strong> ({data.totalArea.toFixed(1)} ha)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Equipe / Colaboradores Globais */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  Equipe / Operadores no Campo ({selectedCollaborators.length}):
                </Label>
                <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/20 min-h-[32px]">
                  {selectedCollaborators.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">Nenhum operador selecionado</span>
                  ) : (
                    selectedCollaborators.map(c => (
                      <Badge key={c} variant="secondary" className="text-[11px] py-0 px-1.5 flex items-center gap-1 bg-blue-50 text-blue-800">
                        {c}
                        <button type="button" onClick={() => toggleCollaborator(c)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                {collaboratorsList.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border rounded bg-card">
                    {collaboratorsList.map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCollaborator(c.name)}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                          selectedCollaborators.includes(c.name)
                            ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-transparent'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipamentos Utilizados */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5 text-amber-600" />
                  Equipamentos Utilizados ({selectedEquipment.length}):
                </Label>
                <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/20 min-h-[32px]">
                  {selectedEquipment.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">Nenhum equipamento selecionado</span>
                  ) : (
                    selectedEquipment.map(eq => (
                      <Badge key={eq} variant="outline" className="text-[11px] py-0 px-1.5 flex items-center gap-1 bg-card">
                        {eq}
                        <button type="button" onClick={() => toggleEquipment(eq)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                {equipmentList.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border rounded bg-card">
                    {equipmentList.map(eq => (
                      <button
                        type="button"
                        key={eq.id}
                        onClick={() => toggleEquipment(eq.name)}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                          selectedEquipment.includes(eq.name)
                            ? 'bg-amber-100 border-amber-400 text-amber-800 font-medium'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-transparent'
                        }`}
                      >
                        {eq.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="exec-notes" className="text-xs">
                  Observações da Execução (opcional):
                </Label>
                <Textarea
                  id="exec-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Condições climáticas boas, umidade ideal do solo, talhões 1 e 2 finalizados"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Histórico de Execuções Anteriores */}
          {order.executions && order.executions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t text-xs">
              <Label className="font-semibold flex items-center gap-1 text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                Histórico de Execuções Anteriores ({order.executions.length}):
              </Label>
              <div className="max-h-44 overflow-y-auto space-y-1.5">
                {order.executions.map((ex: any, idx) => (
                  <div key={ex.id || idx} className="p-2.5 bg-muted/30 border rounded space-y-1 text-[11px]">
                    <div className="flex justify-between items-center font-semibold">
                      <span>{ex.date}: {ex.areaExecuted || ex.hectares} ha ({ex.percentage}%)</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>

                    {/* Exibe análises da etapa se houver */}
                    {ex.samplesExecuted && (
                      <div className="text-emerald-700 font-medium flex items-center gap-1">
                        <FlaskConical className="h-3 w-3" />
                        {ex.samplesExecuted} {ex.samplesTotal ? `de ${ex.samplesTotal}` : ''} análises/amostras realizadas nesta etapa
                      </div>
                    )}

                    {/* Exibe rateio por operador e produto se houver */}
                    {Array.isArray(ex.splits) && ex.splits.length > 0 && (
                      <div className="pt-1 border-t space-y-0.5 text-[10px] text-amber-950">
                        <div className="font-semibold text-muted-foreground">Apontamento por Operador:</div>
                        {ex.splits.map((s: any, sIdx: number) => (
                          <div key={s.id || sIdx} className="bg-amber-50/60 px-1.5 py-0.5 rounded border border-amber-100 flex justify-between">
                            <span>
                              <strong>{s.collaboratorName}</strong> ({s.equipmentName || 'Máq'}): {s.quantity ? `${s.quantity} ${s.unit} de ` : ''}<strong>{s.productName}</strong>
                              {s.plotName ? ` • ${s.plotName}` : ''}
                            </span>
                            <span className="font-medium">{s.areaHa} ha</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(ex.collaborators?.length > 0 || ex.collaboratorName) && (
                      <div className="text-muted-foreground text-[10px]">
                        Equipe: {ex.collaborators?.join(', ') || ex.collaboratorName}
                      </div>
                    )}

                    {ex.notes && <div className="text-muted-foreground italic text-[10px]">{ex.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {(remainingArea > 0 || (totalSamples > 0 && remainingSamples > 0)) && (
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 font-semibold"
              onClick={handleConfirm}
              disabled={
                submitting ||
                (executionType === 'partial' &&
                  (!partialArea || parseFloat(partialArea) <= 0) &&
                  (!stepSamples || parseInt(stepSamples, 10) <= 0))
              }
            >
              Confirmar Execução
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order, OrderSchedule } from '@/hooks/useOrders';
import { Calendar, Plus, Clock, Users, Wrench, X, MapPin, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { generateUUID } from '@/lib/utils';

interface OrderScheduleDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSchedule: (orderId: string, schedule: {
    scheduledDate: string;
    description: string;
    plotName?: string;
    plotId?: string;
    plotNames?: string[];
    yearCycle?: number;
    cycleLabel?: string;
    stageName?: string;
    collaborators?: string[];
    equipmentNames?: string[];
  }) => Promise<void>;
}

const EQUALIZA_STAGES = [
  'Amostragem de Solo (AP)',
  'Conferência de Solo',
  'Coleta Foliar (Safra)',
  'Compactação de Solo',
  'Voo de Drone (Mapeamento)',
  'Reunião de Devolutiva / Apresentação de Mapas',
];

export const OrderScheduleDialog: React.FC<OrderScheduleDialogProps> = ({
  order,
  open,
  onOpenChange,
  onAddSchedule,
}) => {
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [stageName, setStageName] = useState<string>('');
  const [yearCycle, setYearCycle] = useState<number>(1);
  const [selectedPlotsForSchedule, setSelectedPlotsForSchedule] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [collaboratorsList, setCollaboratorsList] = useState<{ id: string; name: string; role?: string }[]>([]);
  const [equipmentList, setEquipmentList] = useState<{ id: string; name: string; type?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Local state for instant reactive UI updates
  const [schedulesList, setSchedulesList] = useState<any[]>(order?.schedules || []);

  const isEqualiza = useMemo(() => {
    if (!order) return false;
    const combined = `${order.serviceName || ''} ${order.type || ''}`.toLowerCase();
    return combined.includes('equaliza');
  }, [order]);

  const contractYears = useMemo(() => {
    if (!order) return 1;
    // 1. Campo explícito no order
    if ((order as any).contractYears && Number((order as any).contractYears) > 0) {
      return Number((order as any).contractYears);
    }
    const details = (order as any).serviceDetails || (order as any).service_details || {};
    if (details.contractYears && Number(details.contractYears) > 0) {
      return Number(details.contractYears);
    }
    if (details.anosCiclo && Number(details.anosCiclo) > 0) {
      return Number(details.anosCiclo);
    }
    // 2. ProductsData
    if (Array.isArray(order.productsData)) {
      const eqItem = order.productsData.find((p: any) => p.contractYears || p.anosCiclo || p.id === 'equaliza_contract');
      if (eqItem?.contractYears && Number(eqItem.contractYears) > 0) {
        return Number(eqItem.contractYears);
      }
      if (eqItem?.anosCiclo && Number(eqItem.anosCiclo) > 0) {
        return Number(eqItem.anosCiclo);
      }
    }
    // 3. Regex em campos de texto do pedido (ex: "2 anos", "2 safras")
    const textToSearch = `${order.serviceName || ''} ${order.type || ''} ${order.serviceGroup || ''} ${JSON.stringify(order.productsData || [])}`;
    const match = textToSearch.match(/(\d+)\s*(?:anos|safras|ano|safra)/i);
    if (match && parseInt(match[1], 10) >= 1 && parseInt(match[1], 10) <= 5) {
      return parseInt(match[1], 10);
    }
    // 4. Se houver agendamentos prévios com yearCycle, usa o maior
    if (Array.isArray(order.schedules) && order.schedules.length > 0) {
      const maxYear = order.schedules.reduce((max: number, s: any) => Math.max(max, s.yearCycle || 1), 1);
      if (maxYear > 1) return Math.min(5, maxYear);
    }
    return 3;
  }, [order]);

  const availablePlots = useMemo(() => {
    if (!order) return [];
    if (Array.isArray(order.plots) && order.plots.length > 0) {
      // Deduplicar talhões por nome para evitar duplicatas em pedidos com múltiplos produtos aplicados no mesmo talhão
      const seen = new Set<string>();
      const deduped: any[] = [];
      order.plots.forEach((p: any) => {
        const name = typeof p === 'string' ? p.trim() : (p?.name || p?.id || '').trim();
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          deduped.push(p);
        }
      });
      return deduped;
    }
    return [];
  }, [order]);

  useEffect(() => {
    if (order?.schedules) {
      setSchedulesList(order.schedules);
    }
  }, [order?.schedules]);

  useEffect(() => {
    if (open) {
      fetchOptions();
      if (order?.schedules) {
        setSchedulesList(order.schedules);
      }
      setSelectedPlotsForSchedule([]);
      setSelectedCollaborators([]);
      setSelectedEquipment([]);
      setScheduledDate('');
      setDescription('');
      setYearCycle(1);
      setStageName(isEqualiza ? EQUALIZA_STAGES[0] : '');
    }
  }, [open, order, isEqualiza]);

  const fetchOptions = async () => {
    try {
      const [collabs, equips] = await Promise.all([
        api.get<any[]>('/collaborators').catch(() => []),
        api.get<any[]>('/equipment').catch(() => [])
      ]);
      if (Array.isArray(collabs)) setCollaboratorsList(collabs);
      if (Array.isArray(equips)) setEquipmentList(equips);
    } catch { }
  };

  if (!order) return null;

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

  const togglePlot = (plotName: string) => {
    setSelectedPlotsForSchedule(prev =>
      prev.includes(plotName) ? prev.filter(p => p !== plotName) : [...prev, plotName]
    );
  };

  const handleAutoPlanSchedules = async () => {
    if (!order) return;
    setSubmitting(true);
    const currentYear = new Date().getFullYear();
    const generated: OrderSchedule[] = [];
    const plotNames = availablePlots.map((p) => typeof p === 'string' ? p : p.name || p.id);

    for (let yr = 1; yr <= contractYears; yr++) {
      const cycleYear = currentYear + (yr - 1);
      const cycleLabel = `Ano ${yr} (Safra ${cycleYear}/${cycleYear + 1})`;
      const apPlotsForYear = plotNames.filter((_, idx) => (idx % contractYears) === (yr - 1));

      // 1. Amostragem em Grid (AP)
      generated.push({
        id: generateUUID(),
        scheduledDate: `${cycleYear}-08-15`,
        date: `${cycleYear}-08-15`,
        description: `Amostragem em Grid (AP) - ${cycleLabel}`,
        notes: `Amostragem em Grid (AP) - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Amostragem de Solo (AP)',
        plotNames: apPlotsForYear.length > 0 ? apPlotsForYear : plotNames,
        plotName: (apPlotsForYear.length > 0 ? apPlotsForYear : plotNames).join(', '),
        status: 'Agendado',
        createdAt: new Date().toISOString(),
      });

      // 2. Conferência nos demais
      generated.push({
        id: generateUUID(),
        scheduledDate: `${cycleYear}-09-10`,
        date: `${cycleYear}-09-10`,
        description: `Conferência de Solo nos demais talhões - ${cycleLabel}`,
        notes: `Conferência de Solo nos demais talhões - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Conferência de Solo',
        plotNames: [],
        status: 'Agendado',
        createdAt: new Date().toISOString(),
      });

      // 3. Devolutiva de Mapas
      generated.push({
        id: generateUUID(),
        scheduledDate: `${cycleYear + 1}-03-05`,
        date: `${cycleYear + 1}-03-05`,
        description: `Devolutiva e Apresentação de Mapas - ${cycleLabel}`,
        notes: `Devolutiva e Apresentação de Mapas - ${cycleLabel}`,
        yearCycle: yr,
        cycleLabel,
        stageName: 'Reunião de Devolutiva / Apresentação de Mapas',
        plotNames: [],
        status: 'Agendado',
        createdAt: new Date().toISOString(),
      });
    }

    setSchedulesList(generated);
    try {
      for (const item of generated) {
        await onAddSchedule(order.id, {
          scheduledDate: item.scheduledDate,
          description: item.description,
          plotNames: item.plotNames || [],
          plotName: item.plotName,
          yearCycle: item.yearCycle,
          cycleLabel: item.cycleLabel,
          stageName: item.stageName,
        });
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) return;
    if (order.status === 'Pendente') return;

    const currentYear = new Date().getFullYear();
    const cycleYearCalculated = currentYear + (yearCycle - 1);
    const cycleLabel = isEqualiza ? `Ano ${yearCycle} (Safra ${cycleYearCalculated}/${cycleYearCalculated + 1})` : undefined;

    const descFinal = description.trim() || (isEqualiza ? `${stageName || 'Etapa Equaliza'} - ${cycleLabel}` : 'Visita Operacional');

    const newScheduleItem: OrderSchedule = {
      id: generateUUID(),
      scheduledDate,
      date: scheduledDate,
      description: descFinal,
      notes: descFinal,
      plotNames: selectedPlotsForSchedule.length > 0 ? selectedPlotsForSchedule : undefined,
      plotName: selectedPlotsForSchedule.join(', ') || undefined,
      yearCycle: isEqualiza ? yearCycle : undefined,
      cycleLabel,
      stageName: stageName || undefined,
      collaborators: selectedCollaborators,
      equipmentNames: selectedEquipment,
      status: 'Agendado',
      createdAt: new Date().toISOString()
    };

    setSchedulesList(prev => [...prev, newScheduleItem]);
    setSubmitting(true);

    try {
      await onAddSchedule(order.id, {
        scheduledDate,
        description: descFinal,
        plotNames: selectedPlotsForSchedule,
        plotName: selectedPlotsForSchedule.join(', '),
        yearCycle: isEqualiza ? yearCycle : undefined,
        cycleLabel,
        stageName,
        collaborators: selectedCollaborators,
        equipmentNames: selectedEquipment,
      });
      setScheduledDate('');
      setDescription('');
      setSelectedPlotsForSchedule([]);
      setSelectedCollaborators([]);
      setSelectedEquipment([]);
    } catch (err) {
      setSchedulesList(order.schedules || []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Calendar className="h-5 w-5 text-primary" />
            Agendamento por Talhão e Cronograma
          </DialogTitle>
          <DialogDescription className="sr-only">
            Gerenciamento de cronograma e agendamento de visitas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card Resumo do Pedido */}
          {order.status === 'Pendente' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Aprovação Pendente:</strong> Este pedido ainda não foi aprovado. Não é permitido criar agendamentos enquanto o pedido estiver aguardando aprovação.
              </span>
            </div>
          )}

          <div className="p-3 border rounded-md bg-muted/30 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">{order.client?.name || order.clientId} • {order.farm?.name || order.farmId}</span>
              {isEqualiza && (
                <Badge className="bg-purple-100 text-purple-900 border-purple-300 font-semibold text-[10px]">
                  Contrato Plurianual Equaliza
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>{order.serviceName || order.type} • {order.area} ha</span>
              {availablePlots && availablePlots.length > 0 && (
                <span className="text-primary font-medium">
                  {availablePlots.length} {availablePlots.length === 1 ? 'talhão contratado' : 'talhões contratados'}
                </span>
              )}
            </div>
          </div>

          {/* Formulário de Novo Agendamento */}
          <form onSubmit={handleAdd} className="p-3 border rounded-md bg-card space-y-3">
            <Label className="font-bold text-xs block text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Agendar Nova Visita / Etapa:
            </Label>

            {/* SE FOR EQUALIZA: SELEÇÃO DE CICLO/ANO E ETAPA (PILAR 4) */}
            {isEqualiza && (
              <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-md space-y-2">
                <div className="text-[11px] font-bold text-purple-950 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    Planejamento Plurianual do Equaliza ({contractYears} {contractYears === 1 ? 'Safra / Ano' : 'Safras / Anos'}):
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-900 border-purple-300">
                    Contrato de {contractYears} anos
                  </Badge>
                </div>

                {schedulesList.length === 0 && (
                  <div className="p-2 bg-purple-100/60 rounded border border-purple-300/60 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-purple-900">
                      Nenhuma visita agendada ainda. Deseja pré-gerar o cronograma padrão para as {contractYears} safras?
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      className="h-6 px-2 text-[10px] bg-purple-700 hover:bg-purple-800 text-white shrink-0"
                      onClick={handleAutoPlanSchedules}
                      disabled={submitting || order.status === 'Pendente'}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Auto-Planejar Visitas
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px]">Ano / Ciclo do Contrato:</Label>
                    <Select
                      value={String(Math.min(yearCycle, contractYears))}
                      onValueChange={(v) => setYearCycle(parseInt(v, 10))}
                    >
                      <SelectTrigger className="h-8 text-xs bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: contractYears }, (_, i) => i + 1).map((yr) => {
                          const currentYear = new Date().getFullYear();
                          const cycleYearCalculated = currentYear + (yr - 1);
                          return (
                            <SelectItem key={yr} value={String(yr)}>
                              Ano {yr} (Safra {cycleYearCalculated}/{cycleYearCalculated + 1})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px]">Tipo da Etapa:</Label>
                    <Select value={stageName} onValueChange={setStageName}>
                      <SelectTrigger className="h-8 text-xs bg-card">
                        <SelectValue placeholder="Selecione a etapa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUALIZA_STAGES.map((s, idx) => (
                          <SelectItem key={idx} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Data e Descrição */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="sched-date" className="text-xs font-semibold">Data Prevista:</Label>
                <Input
                  id="sched-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label htmlFor="sched-desc" className="text-xs font-semibold">Descrição / Observação da Visita:</Label>
                <Input
                  id="sched-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isEqualiza ? "Ex: Coleta AP Talhões 1 e 2" : "Ex: 1ª Visita de Coleta"}
                  className="text-xs h-8"
                />
              </div>
            </div>

            {/* PILAR 1 & 4: SELEÇÃO DE TALHÕES PARA ESTA DATA */}
            {availablePlots.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  Vincular Talhão(ões) a esta Visita:
                </Label>
                <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/20 min-h-[32px]">
                  {selectedPlotsForSchedule.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">
                      Todos os talhões do pedido (ou selecione os específicos abaixo)
                    </span>
                  ) : (
                    selectedPlotsForSchedule.map(pName => (
                      <Badge key={pName} variant="secondary" className="text-[11px] py-0 px-1.5 flex items-center gap-1 bg-emerald-50 text-emerald-800">
                        {pName}
                        <button type="button" onClick={() => togglePlot(pName)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border rounded bg-card">
                  {availablePlots.map((plot: any) => (
                    <button
                      type="button"
                      key={plot.id}
                      onClick={() => togglePlot(plot.name)}
                      className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${selectedPlotsForSchedule.includes(plot.name)
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-medium'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground border-transparent'
                        }`}
                    >
                      {plot.name} ({parseFloat(plot.area || "0").toFixed(1)} ha)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alocar Colaboradores */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                Alocar Colaboradores ({selectedCollaborators.length}):
              </Label>
              <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/20 min-h-[32px]">
                {selectedCollaborators.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">Nenhum selecionado</span>
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
                      className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${selectedCollaborators.includes(c.name)
                          ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground border-transparent'
                        }`}
                    >
                      {c.name} {c.role && <span className="opacity-60 text-[9px]">({c.role})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Alocar Equipamentos */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5 text-amber-600" />
                Alocar Equipamentos ({selectedEquipment.length}):
              </Label>
              <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/20 min-h-[32px]">
                {selectedEquipment.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">Nenhum selecionado</span>
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
                      className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${selectedEquipment.includes(eq.name)
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

            <Button
              type="submit"
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 font-semibold mt-2"
              disabled={submitting || !scheduledDate || order.status === 'Pendente'}
            >
              <Plus className="h-4 w-4 mr-1" />
              {order.status === 'Pendente' ? 'Bloqueado: Pedido Aguardando Aprovação' : submitting ? 'Salvando...' : 'Adicionar Agendamento'}
            </Button>
          </form>

          {/* Lista de Agendamentos Cadastrados */}
          <div className="space-y-2">
            <Label className="font-semibold text-xs flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Cronograma de Agendamentos do Pedido ({schedulesList.length}):
            </Label>

            {schedulesList.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground border border-dashed rounded">
                Nenhum agendamento registrado ainda.
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-2">
                {schedulesList.map((sc: any, idx) => (
                  <div
                    key={sc.id || idx}
                    className="p-2.5 border rounded-md bg-muted/20 flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {sc.scheduledDate || sc.date}
                        {sc.cycleLabel && (
                          <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-800 border-purple-300 font-medium">
                            {sc.cycleLabel}
                          </Badge>
                        )}
                        {order.paymentSchedules && (() => {
                          const linkedPay = order.paymentSchedules.find(p => p.cycleYear === sc.yearCycle);
                          if (!linkedPay) return null;
                          const isPaid = linkedPay.status === 'Pago';
                          return (
                            <Badge variant="outline" className={`text-[10px] ${isPaid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                              💰 Parcela: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(linkedPay.amount)} ({linkedPay.status})
                            </Badge>
                          );
                        })()}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-medium">
                        {sc.status || 'Agendado'}
                      </span>
                    </div>

                    <div className="font-medium text-foreground">{sc.description || sc.notes}</div>

                    {/* Talhões vinculados */}
                    {(sc.plotName || (sc.plotNames && sc.plotNames.length > 0)) && (
                      <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        Talhões: {sc.plotName || sc.plotNames.join(', ')}
                      </div>
                    )}

                    {(sc.collaborators?.length > 0 || sc.equipmentNames?.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-0.5 pt-1 border-t">
                        {sc.collaborators?.map((c: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 font-normal">
                            {c}
                          </Badge>
                        ))}
                        {sc.equipmentNames?.map((eq: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0 px-1 font-normal">
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

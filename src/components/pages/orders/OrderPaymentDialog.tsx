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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order, OrderPaymentSchedule } from '@/hooks/useOrders';
import {
  DollarSign,
  CheckCircle2,
  History,
  AlertCircle,
  CalendarClock,
  ArrowDownLeft,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';
import { getLocalDateISO } from '@/lib/utils';

interface OrderPaymentDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordPayment: (orderId: string, payment: { amount: number; method: string; notes?: string; date?: string }) => Promise<void>;
  onSavePaymentSchedules?: (orderId: string, paymentSchedules: OrderPaymentSchedule[]) => Promise<void>;
  onPayScheduledInstallment?: (orderId: string, scheduleId: string, paymentData: { amount: number; method: string; date?: string; notes?: string }) => Promise<void>;
}

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_SAFRA_CYCLES = [
  { cycle: 1, label: `Ano 1 (Safra ${CURRENT_YEAR}/${CURRENT_YEAR + 1})` },
  { cycle: 2, label: `Ano 2 (Safra ${CURRENT_YEAR + 1}/${CURRENT_YEAR + 2})` },
  { cycle: 3, label: `Ano 3 (Safra ${CURRENT_YEAR + 2}/${CURRENT_YEAR + 3})` },
  { cycle: 4, label: `Ano 4 (Safra ${CURRENT_YEAR + 3}/${CURRENT_YEAR + 4})` },
  { cycle: 5, label: `Ano 5 (Safra ${CURRENT_YEAR + 4}/${CURRENT_YEAR + 5})` },
];

export const OrderPaymentDialog: React.FC<OrderPaymentDialogProps> = ({
  order,
  open,
  onOpenChange,
  onRecordPayment,
  onSavePaymentSchedules,
  onPayScheduledInstallment,
}) => {
  // Tabs: 'cronograma' ou 'recebimento'
  const [activeTab, setActiveTab] = useState<'cronograma' | 'recebimento'>('cronograma');

  // Estado da aba de Recebimento Avulso
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('PIX');
  const [paymentDate, setPaymentDate] = useState<string>(getLocalDateISO());
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Estado da aba de Cronograma de Parcelas / Safras
  const [schedulesList, setSchedulesList] = useState<OrderPaymentSchedule[]>([]);
  const [numSafrasToGenerate, setNumSafrasToGenerate] = useState<number>(3);
  const [firstDueDate, setFirstDueDate] = useState<string>(() => getLocalDateISO());

  // Campos para adicionar parcela avulsa ao cronograma
  const [newInstDesc, setNewInstDesc] = useState<string>('');
  const [newInstAmount, setNewInstAmount] = useState<string>('');
  const [newInstDueDate, setNewInstDueDate] = useState<string>(() => getLocalDateISO());
  const [newInstCycle, setNewInstCycle] = useState<number>(1);
  const [hasUnsavedScheduleChanges, setHasUnsavedScheduleChanges] = useState<boolean>(false);

  // Mini-modal / estado para quitação de parcela específica
  const [payingScheduleId, setPayingScheduleId] = useState<string | null>(null);
  const [paySchedMethod, setPaySchedMethod] = useState<string>('PIX');
  const [paySchedDate, setPaySchedDate] = useState<string>(getLocalDateISO());
  const [paySchedNotes, setPaySchedNotes] = useState<string>('');

  const totalValue = order?.numericValue || 0;
  const paidAmount = order?.paidAmount || 0;
  const remainingAmount = Math.max(0, totalValue - paidAmount);
  const percentPaid = totalValue > 0 ? Math.min(100, (paidAmount / totalValue) * 100) : 0;

  const isEqualiza = useMemo(() => {
    if (!order) return false;
    const name = `${order.serviceName || ''} ${order.type || ''}`.toLowerCase();
    return name.includes('equaliz');
  }, [order]);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDisplayDate = (raw: any): string => {
    if (!raw) return '—';
    if (typeof raw === 'string') {
      const clean = raw.includes('T') ? raw.split('T')[0] : raw;
      const parts = clean.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return clean;
    }
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch {}
    return String(raw);
  };

  // Inicializa estados ao abrir o modal
  useEffect(() => {
    if (order && open) {
      if (remainingAmount > 0) {
        setDisplayAmount(remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } else {
        setDisplayAmount('');
      }
      setPaymentDate(getLocalDateISO());
      setNotes('');
      const normalizedSchedules: OrderPaymentSchedule[] = (order.paymentSchedules || []).map((s: any, idx: number, arr: any[]) => ({
        ...s,
        id: s.id || `sched-pay-${idx}-${Date.now()}`,
        dueDate: typeof s.dueDate === 'string' && s.dueDate.includes('T') ? s.dueDate.split('T')[0] : (s.dueDate || getLocalDateISO()),
        amount: Number(s.amount) || 0,
        description: s.description || s.descricao || `${idx + 1}ª Parcela`,
        cycleYear: s.cycleYear || s.ano || 1,
        installmentNumber: s.installmentNumber || s.numeroParcela || idx + 1,
        totalInstallments: s.totalInstallments || arr.length,
        status: s.status || 'Pendente',
      }));
      setSchedulesList(normalizedSchedules);
      setHasUnsavedScheduleChanges(false);
      setPayingScheduleId(null);

      // Define aba inicial: se for Equaliza ou tiver cronograma, foca em 'cronograma'
      if (isEqualiza || (order.paymentSchedules && order.paymentSchedules.length > 0)) {
        setActiveTab('cronograma');
      } else {
        setActiveTab('recebimento');
      }
    }
  }, [order, open, remainingAmount, isEqualiza]);

  const parsedAmount = useMemo(() => {
    const clean = displayAmount.replace(/[R$\s.]/g, '').replace(',', '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  }, [displayAmount]);

  const projectedRemaining = Math.max(0, remainingAmount - parsedAmount);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (!v) {
      setDisplayAmount('');
      return;
    }
    const num = parseInt(v) / 100;
    setDisplayAmount(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  // Gerador Automático de Parcelas de Safras para Contratos Plurianuais (Equaliza)
  const handleGenerateSafrasSchedule = () => {
    if (totalValue <= 0 || numSafrasToGenerate <= 0) return;

    const baseVal = Math.floor((totalValue / numSafrasToGenerate) * 100) / 100;
    const remainder = Math.round((totalValue - (baseVal * numSafrasToGenerate)) * 100) / 100;

    const [yearStr, monthStr, dayStr] = (firstDueDate || '2026-04-30').split('-');
    const baseYear = parseInt(yearStr, 10) || 2026;
    const month = monthStr || '04';
    const day = dayStr || '30';

    const generated: OrderPaymentSchedule[] = [];
    for (let i = 1; i <= numSafrasToGenerate; i++) {
      const year = baseYear + (i - 1);
      const harvestLabel = `Safra ${year - 1}/${year}`;
      const cycleInfo = DEFAULT_SAFRA_CYCLES.find(c => c.cycle === i) || {
        cycle: i,
        label: `Ano ${i} (${harvestLabel})`
      };

      const val = i === 1 ? baseVal + remainder : baseVal;

      generated.push({
        id: `sched-pay-${Date.now()}-${i}`,
        installmentNumber: i,
        totalInstallments: numSafrasToGenerate,
        cycleYear: i,
        cycleLabel: cycleInfo.label,
        description: `${i}ª Parcela - ${harvestLabel}`,
        dueDate: `${year}-${month}-${day}`,
        amount: val,
        status: 'Pendente'
      });
    }

    setSchedulesList(generated);
    setHasUnsavedScheduleChanges(true);
  };

  // Adicionar Parcela Avulsa Manualmente
  const handleAddManualInstallment = () => {
    const clean = newInstAmount.replace(/[R$\s.]/g, '').replace(',', '.');
    const val = parseFloat(clean) || 0;
    if (val <= 0 || !newInstDueDate) return;

    const cycleInfo = DEFAULT_SAFRA_CYCLES.find(c => c.cycle === newInstCycle) || {
      cycle: newInstCycle,
      label: `Ano ${newInstCycle}`
    };

    const nextInstNumber = schedulesList.length + 1;
    const newItem: OrderPaymentSchedule = {
      id: `sched-pay-${Date.now()}`,
      installmentNumber: nextInstNumber,
      totalInstallments: nextInstNumber,
      cycleYear: newInstCycle,
      cycleLabel: cycleInfo.label,
      description: newInstDesc.trim() || `${nextInstNumber}ª Parcela - ${cycleInfo.label}`,
      dueDate: newInstDueDate,
      amount: val,
      status: 'Pendente'
    };

    const updated = [...schedulesList, newItem].map((item, idx, arr) => ({
      ...item,
      totalInstallments: arr.length
    }));

    setSchedulesList(updated);
    setHasUnsavedScheduleChanges(true);
    setNewInstDesc('');
    setNewInstAmount('');
  };

  // Editar campo de uma parcela do cronograma (data de vencimento, valor ou descrição)
  const handleUpdateScheduleField = (
    id: string,
    field: 'dueDate' | 'amount' | 'description',
    value: string | number
  ) => {
    setSchedulesList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'amount') {
          return { ...item, amount: Number(value) || 0 };
        }
        return { ...item, [field]: value };
      })
    );
    setHasUnsavedScheduleChanges(true);
  };

  // Remover Parcela do Cronograma
  const handleRemoveSchedule = (id: string) => {
    const updated = schedulesList.filter(s => s.id !== id);
    setSchedulesList(updated);
    setHasUnsavedScheduleChanges(true);
  };

  // Salvar Cronograma Completo de Parcelas
  const handleSaveCronograma = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      if (onSavePaymentSchedules) {
        await onSavePaymentSchedules(order.id, schedulesList);
        setHasUnsavedScheduleChanges(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Executar Baixa na Parcela Específica
  const handleConfirmInstallmentPayment = async (scheduleId: string) => {
    if (!order) return;
    const target = schedulesList.find(s => s.id === scheduleId);
    if (!target) return;
    if (order.status === 'Pendente') return;

    setSubmitting(true);
    try {
      if (onPayScheduledInstallment) {
        await onPayScheduledInstallment(order.id, scheduleId, {
          amount: target.amount,
          method: paySchedMethod,
          date: paySchedDate,
          notes: paySchedNotes.trim() || undefined
        });
      } else {
        await onRecordPayment(order.id, {
          amount: target.amount,
          method: paySchedMethod,
          notes: paySchedNotes.trim() || `${target.description} quitada`,
          date: paySchedDate
        });
      }
      setPayingScheduleId(null);
      setPaySchedNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmar Recebimento Avulso
  const handleConfirmSinglePayment = async () => {
    if (!order || parsedAmount <= 0 || order.status === 'Pendente') return;

    setSubmitting(true);
    try {
      await onRecordPayment(order.id, {
        amount: parsedAmount,
        method,
        notes: notes.trim() || undefined,
        date: paymentDate,
      });

      setDisplayAmount('');
      setNotes('');
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Gestão Financeira & Cobrança
            </DialogTitle>
            {isEqualiza && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Contrato Plurianual Equaliza
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs">
            Planejamento de safras futuras, cronograma de pagamentos agendados e registro de baixas
          </DialogDescription>
        </DialogHeader>

        {/* Resumo Financeiro Superior */}
        <div className="p-3 border rounded-lg bg-muted/20 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">Cliente / Fazenda:</span>
            <span className="font-semibold text-foreground">
              {order.client?.name || order.clientId} • {order.farm?.name || order.farmId}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">Serviço Contratado:</span>
            <span className="font-medium text-foreground">{order.serviceName || order.type}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
            <div className="p-2 bg-background rounded border">
              <span className="block text-[11px] text-muted-foreground">Valor Total:</span>
              <strong className="text-xs sm:text-sm text-foreground">{formatBRL(totalValue)}</strong>
            </div>
            <div className="p-2 bg-emerald-50/50 rounded border border-emerald-100">
              <span className="block text-[11px] text-emerald-700">Total Já Quitado:</span>
              <strong className="text-xs sm:text-sm text-emerald-700">{formatBRL(paidAmount)}</strong>
            </div>
            <div className="p-2 bg-amber-50/50 rounded border border-amber-100">
              <span className="block text-[11px] text-amber-700">Saldo a Receber:</span>
              <strong className="text-xs sm:text-sm text-amber-700">{formatBRL(remainingAmount)}</strong>
            </div>
          </div>

          {/* Barra de Progresso Financeira */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Progresso de Liquidação:</span>
              <span className="font-semibold text-foreground">{percentPaid.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${percentPaid >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>
        </div>

        {/* Abas: Cronograma de Safras / Parcelas vs Recebimento Avulso */}
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cronograma" className="flex items-center gap-1.5 text-xs">
              <CalendarClock className="h-4 w-4 text-purple-600" />
              <span>Cronograma de Safras / Parcelas</span>
              {schedulesList.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                  {schedulesList.filter(s => s.status === 'Pago').length}/{schedulesList.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recebimento" className="flex items-center gap-1.5 text-xs">
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              <span>Recebimento Avulso & Histórico</span>
              {order.payments && order.payments.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                  {order.payments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* ABA 1: CRONOGRAMA DE SAFRAS E PARCELAS AGENDADAS (EQUALIZA / MULTIANUAL)  */}
          {/* ========================================================================= */}
          <TabsContent value="cronograma" className="space-y-4 pt-2">
            {/* Gerador Automático de Parcelas de Safra */}
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-purple-900">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Gerador Rápido de Parcelamento por Safra (Contrato Multianual):</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Divide o valor total do pedido igualmente pelas safras futuras (ex: safras anuais de 2 a 5 anos):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end pt-1">
                <div>
                  <Label className="text-[11px]">Quantidade de Safras / Anos:</Label>
                  <Select value={String(numSafrasToGenerate)} onValueChange={(v) => setNumSafrasToGenerate(Number(v))}>
                    <SelectTrigger className="h-8 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Safras (2 Anos)</SelectItem>
                      <SelectItem value="3">3 Safras (3 Anos)</SelectItem>
                      <SelectItem value="4">4 Safras (4 Anos)</SelectItem>
                      <SelectItem value="5">5 Safras (5 Anos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px]">Vencimento da 1ª Safra:</Label>
                  <Input
                    type="date"
                    value={firstDueDate}
                    onChange={(e) => setFirstDueDate(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleGenerateSafrasSchedule}
                  className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar {numSafrasToGenerate} Safras
                </Button>
              </div>
            </div>

            {/* Listagem das Parcelas Agendadas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <Label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Parcelas e Safras Programadas ({schedulesList.length}):
                </Label>
                {schedulesList.length > 0 && (
                  <div className="flex items-center gap-2">
                    {hasUnsavedScheduleChanges && (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Alterações pendentes
                      </span>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant={hasUnsavedScheduleChanges ? "default" : "outline"}
                      onClick={handleSaveCronograma}
                      disabled={submitting}
                      className={
                        hasUnsavedScheduleChanges
                          ? "h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                          : "h-7 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                      }
                    >
                      Salvar Cronograma
                    </Button>
                  </div>
                )}
              </div>

              {schedulesList.length === 0 ? (
                <div className="p-6 text-center border rounded-lg bg-muted/10 text-muted-foreground text-xs space-y-1">
                  <CalendarClock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-1" />
                  <p className="font-medium">Nenhum cronograma de safras programado ainda.</p>
                  <p className="text-[11px]">Use o gerador acima ou adicione parcelas avulsas abaixo para agendar os pagamentos plurianuais.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto bg-background">
                  <Table className="text-xs w-full">
                    <TableHeader className="bg-muted/40">
                      <TableRow className="h-8">
                        <TableHead className="py-1.5 px-2.5">Safra / Parcela</TableHead>
                        <TableHead className="py-1.5 px-2 w-[145px]">Vencimento</TableHead>
                        <TableHead className="py-1.5 px-2 w-[135px]">Valor (R$)</TableHead>
                        <TableHead className="py-1.5 px-2 w-[90px]">Status</TableHead>
                        <TableHead className="py-1.5 px-2.5 text-right w-[135px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedulesList.map((sched) => {
                        const isPaid = sched.status === 'Pago';
                        return (
                          <TableRow key={sched.id} className="hover:bg-muted/30">
                            <TableCell className="py-2 px-2.5 align-middle">
                              {isPaid ? (
                                <div className="font-medium text-foreground">{sched.description}</div>
                              ) : (
                                <Input
                                  value={sched.description}
                                  onChange={(e) => handleUpdateScheduleField(sched.id, 'description', e.target.value)}
                                  className="h-8 text-xs bg-white px-2 w-full min-w-[150px]"
                                />
                              )}
                              {sched.cycleLabel && (
                                <Badge variant="outline" className="text-[10px] mt-1 bg-purple-50 text-purple-700 border-purple-200 whitespace-nowrap">
                                  {sched.cycleLabel}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-2 align-middle text-muted-foreground">
                              {isPaid ? (
                                <span className="whitespace-nowrap">{formatDisplayDate(sched.dueDate)}</span>
                              ) : (
                                <Input
                                  type="date"
                                  value={
                                    typeof sched.dueDate === 'string' && sched.dueDate.includes('T')
                                      ? sched.dueDate.split('T')[0]
                                      : sched.dueDate || ''
                                  }
                                  onChange={(e) => handleUpdateScheduleField(sched.id, 'dueDate', e.target.value)}
                                  className="h-8 w-[136px] text-xs bg-white px-2 font-medium text-slate-800"
                                />
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-2 align-middle font-semibold text-foreground">
                              {isPaid ? (
                                <span className="whitespace-nowrap">{formatBRL(sched.amount)}</span>
                              ) : (
                                <div className="relative flex items-center">
                                  <span className="absolute left-2 text-[11px] font-medium text-muted-foreground pointer-events-none">
                                    R$
                                  </span>
                                  <DecimalInput
                                    value={sched.amount}
                                    onValueChange={(val) => handleUpdateScheduleField(sched.id, 'amount', val ?? 0)}
                                    className="h-8 w-[124px] text-xs bg-white pl-7 pr-2 font-semibold text-slate-900 text-right"
                                  />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-2 align-middle whitespace-nowrap">
                              {isPaid ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] whitespace-nowrap">
                                  Quitado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] whitespace-nowrap">
                                  A Vencer
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-2.5 align-middle text-right whitespace-nowrap">
                              {isPaid ? (
                                <span className="text-[11px] text-muted-foreground italic">
                                  {sched.paymentMethod || 'Pago'}
                                </span>
                              ) : (
                                <div className="flex justify-end items-center gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setPayingScheduleId(sched.id);
                                      setPaySchedDate(getLocalDateISO());
                                    }}
                                    className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 whitespace-nowrap"
                                  >
                                    <Check className="h-3 w-3" />
                                    Dar Baixa
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSchedule(sched.id)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                    title="Remover parcela"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Mini-painel de Baixa Rápida na Parcela */}
              {payingScheduleId && (
                <div className="p-3 border-2 border-emerald-400 bg-emerald-50/40 rounded-lg space-y-2 text-xs animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Confirmar Baixa na Parcela: {schedulesList.find(s => s.id === payingScheduleId)?.description}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPayingScheduleId(null)}
                      className="h-5 text-xs text-muted-foreground"
                    >
                      Cancelar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[11px]">Data Efetiva do Pagamento:</Label>
                      <Input
                        type="date"
                        value={paySchedDate}
                        onChange={(e) => setPaySchedDate(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Forma de Pagamento:</Label>
                      <Select value={paySchedMethod} onValueChange={setPaySchedMethod}>
                        <SelectTrigger className="h-8 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Transferência">Transferência Bancária</SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px]">Obs / Comprovante:</Label>
                      <Input
                        value={paySchedNotes}
                        onChange={(e) => setPaySchedNotes(e.target.value)}
                        placeholder="Ex: Pago com soja safra"
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="button"
                      onClick={() => handleConfirmInstallmentPayment(payingScheduleId)}
                      disabled={submitting}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Confirmar Quitação ({formatBRL(schedulesList.find(s => s.id === payingScheduleId)?.amount || 0)})
                    </Button>
                  </div>
                </div>
              )}

              {/* Adicionar Parcela Avulsa Manual */}
              <div className="p-2.5 border rounded-lg bg-muted/10 space-y-2 text-xs">
                <span className="font-semibold text-foreground text-[11px] block">
                  + Adicionar Parcela Avulsa ao Cronograma:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div className="sm:col-span-1">
                    <Label className="text-[11px]">Ciclo / Safra:</Label>
                    <Select value={String(newInstCycle)} onValueChange={(v) => setNewInstCycle(Number(v))}>
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_SAFRA_CYCLES.map(c => (
                          <SelectItem key={c.cycle} value={String(c.cycle)}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px]">Vencimento:</Label>
                    <Input
                      type="date"
                      value={newInstDueDate}
                      onChange={(e) => setNewInstDueDate(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px]">Valor da Parcela (R$):</Label>
                    <Input
                      placeholder="0,00"
                      value={newInstAmount}
                      onChange={(e) => setNewInstAmount(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddManualInstallment}
                    className="h-8 text-xs border-dashed gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Incluir Parcela
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* ABA 2: RECEBIMENTO AVULSO & HISTÓRICO DE BAIXAS REALIZADAS                */}
          {/* ========================================================================= */}
          <TabsContent value="recebimento" className="space-y-3 pt-2">
            {order.status === 'Pendente' && (
              <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-xs flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Aprovação Pendente:</strong> Este pedido ainda não foi aprovado. É obrigatório aprovar o pedido antes de registrar recebimentos ou baixas financeiras.
                </span>
              </div>
            )}

            {remainingAmount <= 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Este pedido já foi 100% quitado!
              </div>
            ) : (
              <div className="space-y-3">
                {/* Input com máscara monetária */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label htmlFor="pay-amount-masked" className="text-xs font-semibold">
                      Valor Deste Pagamento (R$):
                    </Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDisplayAmount((remainingAmount / 2).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                      >
                        50% ({formatBRL(remainingAmount / 2)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayAmount(remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                        className="text-[11px] text-emerald-600 hover:underline font-semibold"
                      >
                        Quitar Saldo Total
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-muted-foreground font-semibold">R$</span>
                    <Input
                      id="pay-amount-masked"
                      value={displayAmount}
                      onChange={handleAmountChange}
                      placeholder="0,00"
                      className="pl-9 font-bold text-sm text-foreground h-9"
                    />
                  </div>

                  {/* Previsão do Saldo Restante */}
                  <div className="mt-1.5 flex justify-between items-center text-xs p-1.5 rounded bg-muted/40 border">
                    <span className="text-muted-foreground">Saldo Restante Após Esta Baixa:</span>
                    <strong className={projectedRemaining === 0 ? "text-emerald-600" : "text-amber-600"}>
                      {formatBRL(projectedRemaining)} {projectedRemaining === 0 ? "(Quitado)" : "(Parcial)"}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pay-date" className="text-xs font-semibold">Data do Recebimento:</Label>
                    <Input
                      id="pay-date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="mt-1 text-xs h-8"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pay-method" className="text-xs font-semibold">Forma de Pagamento:</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger id="pay-method" className="mt-1 text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Transferência">Transferência Bancária</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pay-notes" className="text-xs font-semibold">Observações / Comprovante (Opcional):</Label>
                  <Input
                    id="pay-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Parcela safra paga via PIX"
                    className="mt-1 text-xs h-8"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleConfirmSinglePayment}
                    disabled={submitting || parsedAmount <= 0 || order.status === 'Pendente'}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    {order.status === 'Pendente' ? 'Bloqueado: Pedido Aguardando Aprovação' : `Confirmar Recebimento (${formatBRL(parsedAmount)})`}
                  </Button>
                </div>
              </div>
            )}

            {/* Histórico de Recebimentos Realizados */}
            {order.payments && order.payments.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t text-xs">
                <Label className="font-semibold flex items-center gap-1 text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  Histórico de Recebimentos Realizados ({order.payments.length}):
                </Label>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {order.payments.map((p, idx) => (
                    <div key={p.id || idx} className="p-2 bg-muted/40 rounded flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-semibold">{formatDisplayDate(p.date)}</span>: {formatBRL(p.amount)} ({p.method})
                        {p.notes && <div className="text-muted-foreground italic text-[10px]">{p.notes}</div>}
                      </div>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2 border-t flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

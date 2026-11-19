import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Client } from '@/hooks/useClients';
import { useOrders, Order, OrderSchedule, OrderExecution, OrderPayment } from '@/hooks/useOrders';
import { useFarms, Farm, Plot } from '@/hooks/useFarms';
import { formatCPF, formatPhoneNumber, formatDateBR } from '@/lib/utils';
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Phone,
  Mail,
  Printer,
  Play,
  CreditCard,
  CalendarClock,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Tractor,
  FlaskConical,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { OrderPrintDialog } from '../orders/OrderPrintDialog';
import { OrderExecutionDialog } from '../orders/OrderExecutionDialog';
import { OrderPaymentDialog } from '../orders/OrderPaymentDialog';
import { OrderScheduleDialog } from '../orders/OrderScheduleDialog';

interface CustomerDossierDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToFarms?: (customerCpf: string, customerName?: string, customerId?: string) => void;
  onNewOrder?: (client: Client) => void;
}

export const CustomerDossierDialog: React.FC<CustomerDossierDialogProps> = ({
  client,
  open,
  onOpenChange,
  onNavigateToFarms,
  onNewOrder,
}) => {
  const { orders, recordExecution, recordPayment, addSchedule } = useOrders();
  const { farms } = useFarms();

  const [activeTab, setActiveTab] = useState('orders');

  // Dialogs de Ações por Pedido
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [selectedOrderForExecution, setSelectedOrderForExecution] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedOrderForSchedule, setSelectedOrderForSchedule] = useState<Order | null>(null);

  // Pedidos vinculados ao cliente
  const clientOrders = useMemo(() => {
    if (!client) return [];
    return orders.filter(
      (o) =>
        (o.clientId && o.clientId === client.id) ||
        (o.client?.id && o.client.id === client.id) ||
        (o.client?.name && client.name && o.client.name.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
  }, [orders, client]);

  // Fazendas vinculadas ao cliente
  const clientFarms = useMemo(() => {
    if (!client) return [];
    return farms.filter(
      (f) =>
        (f.clientId && f.clientId === client.id) ||
        (f.client?.id && f.client.id === client.id) ||
        (f.client?.name && client.name && f.client.name.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
  }, [farms, client]);

  // Total de Talhões
  const totalPlots = useMemo(() => {
    return clientFarms.reduce((acc, farm) => acc + (farm.plots?.length || 0), 0);
  }, [clientFarms]);

  // Área Total das Fazendas (ha / alq)
  const totalAreaFarms = useMemo(() => {
    return clientFarms.reduce((acc, farm) => {
      const area = typeof farm.area === 'number' ? farm.area : parseFloat(String(farm.area || 0));
      return acc + (isNaN(area) ? 0 : area);
    }, 0);
  }, [clientFarms]);

  // Métricas Financeiras Consolidadas
  const financialMetrics = useMemo(() => {
    let totalContracted = 0;
    let totalPaid = 0;

    clientOrders.forEach((o) => {
      totalContracted += Number(o.numericValue || 0);
      totalPaid += Number(o.paidAmount || 0);
    });

    const balance = Math.max(0, totalContracted - totalPaid);
    const percentPaid = totalContracted > 0 ? (totalPaid / totalContracted) * 100 : 0;

    return {
      totalContracted,
      totalPaid,
      balance,
      percentPaid,
    };
  }, [clientOrders]);

  // Todos os Agendamentos do Cliente
  const allSchedules = useMemo(() => {
    const list: Array<OrderSchedule & { orderId: string; serviceName: string; farmName?: string }> = [];
    clientOrders.forEach((order) => {
      if (Array.isArray(order.schedules)) {
        order.schedules.forEach((sch) => {
          list.push({
            ...sch,
            orderId: order.id,
            serviceName: order.serviceName || order.type,
            farmName: order.farm?.name,
          });
        });
      }
    });

    return list.sort((a, b) => new Date(b.scheduledDate || b.date || 0).getTime() - new Date(a.scheduledDate || a.date || 0).getTime());
  }, [clientOrders]);

  // Todas as Execuções de Campo do Cliente
  const allExecutions = useMemo(() => {
    const list: Array<OrderExecution & { orderId: string; serviceName: string; farmName?: string }> = [];
    clientOrders.forEach((order) => {
      if (Array.isArray(order.executions)) {
        order.executions.forEach((ex) => {
          list.push({
            ...ex,
            orderId: order.id,
            serviceName: order.serviceName || order.type,
            farmName: order.farm?.name,
          });
        });
      }
    });

    return list.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
  }, [clientOrders]);

  // Parcelas / Cronograma de Pagamentos Consolidados
  const allPaymentSchedules = useMemo(() => {
    const list: Array<any & { orderId: string; serviceName: string }> = [];
    clientOrders.forEach((order) => {
      if (Array.isArray(order.paymentSchedules)) {
        order.paymentSchedules.forEach((ps) => {
          list.push({
            ...ps,
            orderId: order.id,
            serviceName: order.serviceName || order.type,
          });
        });
      }
    });

    return list.sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
  }, [clientOrders]);

  // Linha do tempo unificada de eventos
  const timelineEvents = useMemo(() => {
    const events: Array<{
      id: string;
      date: string;
      title: string;
      description: string;
      type: 'order' | 'execution' | 'payment' | 'schedule' | 'client';
      badge: string;
    }> = [];

    if (client?.created_at) {
      events.push({
        id: `client-created-${client.id}`,
        date: String(client.created_at),
        title: 'Produtor Cadastrado no Sistema',
        description: `Cadastro inicial de ${client.name} realizado.`,
        type: 'client',
        badge: 'Cadastro',
      });
    }

    clientOrders.forEach((o) => {
      if (o.createdAt) {
        events.push({
          id: `order-${o.id}`,
          date: o.createdAt,
          title: `Pedido Emitido: ${o.serviceName || o.type}`,
          description: `Área: ${o.area} | Valor: R$ ${Number(o.numericValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          type: 'order',
          badge: o.status,
        });
      }

      if (Array.isArray(o.executions)) {
        o.executions.forEach((ex, idx) => {
          events.push({
            id: `exec-${o.id}-${idx}`,
            date: ex.date || ex.createdAt,
            title: `Execução de Campo: ${o.serviceName || o.type}`,
            description: `${ex.areaExecuted || 0} ha executados | ${ex.samplesExecuted || 0} amostras`,
            type: 'execution',
            badge: 'Execução',
          });
        });
      }

      if (Array.isArray(o.payments)) {
        o.payments.forEach((p, idx) => {
          events.push({
            id: `pay-${o.id}-${idx}`,
            date: p.date || p.createdAt,
            title: `Pagamento Recebido: R$ ${Number(p.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            description: `Método: ${p.method || 'Não informado'} | Pedido: ${o.serviceName || o.type}`,
            type: 'payment',
            badge: 'Pago',
          });
        });
      }

      if (Array.isArray(o.schedules)) {
        o.schedules.forEach((s, idx) => {
          events.push({
            id: `sch-${o.id}-${idx}`,
            date: s.scheduledDate || s.date || s.createdAt,
            title: `Serviço Agendado: ${s.description || o.serviceName}`,
            description: `Equipe: ${s.collaborators?.join(', ') || 'A definir'}`,
            type: 'schedule',
            badge: s.status || 'Agendado',
          });
        });
      }
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [client, clientOrders]);

  if (!client) return null;

  const rawPhone = (client.phone || '').replace(/\D/g, '');
  const whatsappUrl = rawPhone ? `https://wa.me/55${rawPhone}?text=Olá%20${encodeURIComponent(client.name)},%20falamos%20da%20Preciza%20Agricultura%20de%20Precisão.` : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-full max-h-[92vh] overflow-y-auto p-0">
          {/* Header Superior do Dossiê */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-bold text-2xl shadow-inner">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white">{client.name}</h2>
                    <Badge variant="outline" className="border-emerald-400 text-emerald-300 bg-emerald-950/50">
                      Dossiê do Produtor
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-emerald-100/80 mt-1">
                    <span><strong>CPF:</strong> {formatCPF(client.cpf)}</span>
                    {client.cad_pro && <span><strong>CAD-PRO:</strong> {client.cad_pro}</span>}
                    <span><strong>Local:</strong> {client.city || 'N/A'} - {client.state || 'PR'}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Rápida no Topo */}
              <div className="flex flex-wrap items-center gap-2">
                {whatsappUrl && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                    onClick={() => window.open(whatsappUrl, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    WhatsApp
                  </Button>
                )}
                {client.email && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => window.open(`mailto:${client.email}`, '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-1.5" />
                    E-mail
                  </Button>
                )}
                {onNewOrder && (
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                    onClick={() => {
                      onOpenChange(false);
                      onNewOrder(client);
                    }}
                  >
                    + Novo Pedido
                  </Button>
                )}
              </div>
            </div>

            {/* Scorecards de Resumo no Cabeçalho */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span>Área Total de Fazendas</span>
                  <Tractor className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold mt-1 text-white">
                  {totalAreaFarms.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ha/alq
                </div>
                <div className="text-xs text-emerald-300/70 mt-0.5">
                  {clientFarms.length} {clientFarms.length === 1 ? 'fazenda' : 'fazendas'} • {totalPlots} talhões
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span>Volume de Pedidos</span>
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold mt-1 text-white">
                  {clientOrders.length} {clientOrders.length === 1 ? 'pedido' : 'pedidos'}
                </div>
                <div className="text-xs text-emerald-300/70 mt-0.5">
                  {clientOrders.filter((o) => o.status === 'Concluído').length} concluídos • {clientOrders.filter((o) => o.status === 'Em Andamento').length} em andamento
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span>Total Contratado</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold mt-1 text-white">
                  R$ {financialMetrics.totalContracted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-emerald-300/70 mt-0.5">
                  Pago: R$ {financialMetrics.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span>Saldo a Receber</span>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                </div>
                <div className={`text-xl font-bold mt-1 ${financialMetrics.balance > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  R$ {financialMetrics.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-emerald-300/70 mt-0.5">
                  {financialMetrics.percentPaid.toFixed(1)}% quitado
                </div>
              </div>
            </div>
          </div>

          {/* Abas Especializadas */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 w-full mb-6 bg-slate-100 p-1">
                <TabsTrigger value="orders" className="text-xs md:text-sm">
                  <FileText className="h-4 w-4 mr-1.5 hidden md:inline" />
                  Pedidos ({clientOrders.length})
                </TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs md:text-sm">
                  <Calendar className="h-4 w-4 mr-1.5 hidden md:inline" />
                  Agenda ({allSchedules.length})
                </TabsTrigger>
                <TabsTrigger value="farms" className="text-xs md:text-sm">
                  <MapPin className="h-4 w-4 mr-1.5 hidden md:inline" />
                  Fazendas ({clientFarms.length})
                </TabsTrigger>
                <TabsTrigger value="financial" className="text-xs md:text-sm">
                  <DollarSign className="h-4 w-4 mr-1.5 hidden md:inline" />
                  Financeiro
                </TabsTrigger>
                <TabsTrigger value="executions" className="text-xs md:text-sm">
                  <FlaskConical className="h-4 w-4 mr-1.5 hidden md:inline" />
                  Coletas ({allExecutions.length})
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs md:text-sm">
                  <Clock className="h-4 w-4 mr-1.5 hidden md:inline" />
                  Linha do Tempo
                </TabsTrigger>
              </TabsList>

              {/* ABA 1: PEDIDOS */}
              <TabsContent value="orders" className="space-y-4">
                {clientOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Nenhum pedido encontrado para este produtor.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Serviço / Pedido</TableHead>
                          <TableHead>Fazenda</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Status Operacional</TableHead>
                          <TableHead>Status Financeiro</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="font-semibold text-slate-900">{order.serviceName || order.type}</div>
                              <div className="text-xs text-muted-foreground">ID: {order.id.substring(0, 8)}...</div>
                            </TableCell>
                            <TableCell>{order.farm?.name || 'N/A'}</TableCell>
                            <TableCell>{order.area} ha/alq</TableCell>
                            <TableCell>
                              <div className="font-medium">
                                R$ {Number(order.numericValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-emerald-600">
                                Pago: R$ {Number(order.paidAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === 'Concluído'
                                    ? 'default'
                                    : order.status === 'Em Andamento'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className={
                                  order.status === 'Concluído'
                                    ? 'bg-emerald-600'
                                    : order.status === 'Em Andamento'
                                    ? 'bg-blue-600 text-white'
                                    : ''
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  order.payment === 'Pago'
                                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                    : order.payment === 'Parcial'
                                    ? 'border-amber-500 text-amber-700 bg-amber-50'
                                    : 'border-slate-300 text-slate-600'
                                }
                              >
                                {order.payment || 'Aguardando'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Folha de Impressão Oficial"
                                  onClick={() => setSelectedOrderForPrint(order)}
                                >
                                  <Printer className="h-4 w-4 text-slate-700" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Registrar Execução de Campo"
                                  onClick={() => setSelectedOrderForExecution(order)}
                                >
                                  <Play className="h-4 w-4 text-emerald-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Registrar Pagamento"
                                  onClick={() => setSelectedOrderForPayment(order)}
                                >
                                  <CreditCard className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Agendar Serviço"
                                  onClick={() => setSelectedOrderForSchedule(order)}
                                >
                                  <CalendarClock className="h-4 w-4 text-purple-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* ABA 2: AGENDA & CRONOGRAMA */}
              <TabsContent value="schedule" className="space-y-4">
                {allSchedules.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Nenhum agendamento de campo registrado para este produtor.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Data Agendada</TableHead>
                          <TableHead>Serviço / Atividade</TableHead>
                          <TableHead>Fazenda / Talhão</TableHead>
                          <TableHead>Equipe / Operadores</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSchedules.map((sch) => (
                          <TableRow key={sch.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-emerald-600" />
                                {formatDateBR(sch.scheduledDate || sch.date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-slate-900">{sch.description || sch.serviceName}</div>
                              {sch.stageName && <div className="text-xs text-muted-foreground">{sch.stageName}</div>}
                            </TableCell>
                            <TableCell>
                              <div>{sch.farmName || 'Fazenda'}</div>
                              {sch.plotName && <div className="text-xs text-muted-foreground">Talhão: {sch.plotName}</div>}
                            </TableCell>
                            <TableCell>
                              {sch.collaborators && sch.collaborators.length > 0
                                ? sch.collaborators.join(', ')
                                : sch.collaborator || 'Equipe técnica'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sch.status === 'Realizado'
                                    ? 'default'
                                    : sch.status === 'Cancelado'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className={sch.status === 'Realizado' ? 'bg-emerald-600' : ''}
                              >
                                {sch.status || 'Agendado'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* ABA 3: FAZENDAS & TALHÕES */}
              <TabsContent value="farms" className="space-y-4">
                {clientFarms.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Nenhuma propriedade rural cadastrada para este produtor.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientFarms.map((farm) => (
                      <Card key={farm.id} className="border shadow-sm">
                        <CardHeader className="bg-slate-50/70 pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Tractor className="h-5 w-5 text-emerald-600" />
                                {farm.name}
                              </CardTitle>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {farm.city} - {farm.state} {farm.registration ? `• Matrícula: ${farm.registration}` : ''}
                              </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-emerald-700 bg-emerald-50">
                              {farm.area} ha/alq
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                            Talhões ({farm.plots?.length || 0})
                          </div>
                          {farm.plots && farm.plots.length > 0 ? (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {farm.plots.map((plot) => (
                                <div
                                  key={plot.id}
                                  className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100"
                                >
                                  <span className="font-medium text-slate-800">{plot.name}</span>
                                  <span className="text-slate-500 font-mono">{plot.area} ha/alq</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">Sem talhões discriminados.</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ABA 4: FINANCEIRO */}
              <TabsContent value="financial" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      Status de Faturamento & Recebíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progresso de Quitação:</span>
                      <span className="font-bold">{financialMetrics.percentPaid.toFixed(1)}%</span>
                    </div>
                    <Progress value={financialMetrics.percentPaid} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                      <div className="p-3 bg-slate-50 rounded-lg border">
                        <div className="text-xs text-slate-500">Total Faturado</div>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          R$ {financialMetrics.totalContracted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="text-xs text-emerald-700">Total Pago</div>
                        <div className="text-lg font-bold text-emerald-800 mt-1">
                          R$ {financialMetrics.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="text-xs text-amber-700">Saldo Pendente</div>
                        <div className="text-lg font-bold text-amber-800 mt-1">
                          R$ {financialMetrics.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cronograma de Parcelas */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                    Cronograma de Parcelas & Safra
                  </h4>
                  {allPaymentSchedules.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                      Nenhum cronograma de parcelas estruturado nos pedidos.
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Parcela / Descrição</TableHead>
                            <TableHead>Ciclo Safra</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allPaymentSchedules.map((ps, idx) => (
                            <TableRow key={ps.id || idx}>
                              <TableCell className="font-medium">{formatDateBR(ps.dueDate)}</TableCell>
                              <TableCell>{ps.description || `Parcela ${ps.installmentNumber || idx + 1}`}</TableCell>
                              <TableCell>{ps.cycleLabel || `Safra ${ps.cycleYear || 1}`}</TableCell>
                              <TableCell className="font-semibold">
                                R$ {Number(ps.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={ps.status === 'Pago' ? 'default' : 'outline'}
                                  className={ps.status === 'Pago' ? 'bg-emerald-600' : 'text-amber-700 border-amber-400 bg-amber-50'}
                                >
                                  {ps.status || 'Pendente'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ABA 5: COLETAS & OPERAÇÕES */}
              <TabsContent value="executions" className="space-y-4">
                {allExecutions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Nenhuma execução de campo registrada até o momento.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Data da Execução</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Fazenda / Talhão</TableHead>
                          <TableHead>Área Executada</TableHead>
                          <TableHead>Amostras</TableHead>
                          <TableHead>Operador / Equipe</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allExecutions.map((ex) => (
                          <TableRow key={ex.id}>
                            <TableCell className="font-medium">{formatDateBR(ex.date || ex.createdAt)}</TableCell>
                            <TableCell>{ex.serviceName}</TableCell>
                            <TableCell>{ex.farmName || 'Fazenda'}</TableCell>
                            <TableCell className="font-semibold text-emerald-700">{ex.areaExecuted || 0} ha</TableCell>
                            <TableCell>{ex.samplesExecuted || 0} pontos</TableCell>
                            <TableCell>{ex.collaboratorName || (ex.collaborators?.join(', ') || 'Equipe Preciza')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* ABA 6: LINHA DO TEMPO */}
              <TabsContent value="timeline" className="space-y-4">
                {timelineEvents.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Nenhum evento registrado no histórico do produtor.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-4 ml-4">
                    {timelineEvents.map((evt) => (
                      <div key={evt.id} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-slate-900">{evt.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {evt.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{evt.description}</p>
                          <span className="text-[11px] text-slate-400 mt-2 block">
                            {formatDateBR(evt.date)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subdialogs Operacionais */}
      {selectedOrderForPrint && (
        <OrderPrintDialog
          order={selectedOrderForPrint}
          client={client}
          farm={selectedOrderForPrint.farm as Farm}
          open={!!selectedOrderForPrint}
          onOpenChange={(isOpen) => !isOpen && setSelectedOrderForPrint(null)}
        />
      )}

      {selectedOrderForExecution && (
        <OrderExecutionDialog
          order={selectedOrderForExecution}
          open={!!selectedOrderForExecution}
          onOpenChange={(isOpen) => !isOpen && setSelectedOrderForExecution(null)}
          onRecordExecution={recordExecution}
        />
      )}

      {selectedOrderForPayment && (
        <OrderPaymentDialog
          order={selectedOrderForPayment}
          open={!!selectedOrderForPayment}
          onOpenChange={(isOpen) => !isOpen && setSelectedOrderForPayment(null)}
          onRecordPayment={recordPayment}
        />
      )}

      {selectedOrderForSchedule && (
        <OrderScheduleDialog
          order={selectedOrderForSchedule}
          open={!!selectedOrderForSchedule}
          onOpenChange={(isOpen) => !isOpen && setSelectedOrderForSchedule(null)}
          onAddSchedule={addSchedule}
        />
      )}
    </>
  );
};

export default CustomerDossierDialog;

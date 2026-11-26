import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  Truck,
  TrendingUp,
  MapPin,
  Printer,
  FileSpreadsheet,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Layers,
  CheckCircle2,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/services/api";
import { cn, getLocalDateISO } from "@/lib/utils";
import { MultiStatusFilter } from "@/components/ui/multi-status-filter";
import { getStoredPdfHeaderConfig, PdfHeaderConfig } from "./settings/PdfHeaderTab";
import { AuditLogsPanel } from "./audit/AuditLogsPanel";

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [apiExecutions, setApiExecutions] = useState<any[]>([]);
  const [pdfConfig, setPdfConfig] = useState<PdfHeaderConfig>(getStoredPdfHeaderConfig());

  // Filtros dinâmicos
  const [periodFilter, setPeriodFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState("all");
  const [farmFilter, setFarmFilter] = useState("all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    loadData();
    setPdfConfig(getStoredPdfHeaderConfig());
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, servicesRes, collabsRes, equipRes, clientsRes, farmsRes, apiExecutionsRes] = await Promise.all([
        api.get<any[]>('/orders').catch(() => []),
        api.get<any[]>('/services').catch(() => []),
        api.get<any[]>('/collaborators').catch(() => []),
        api.get<any[]>('/equipment').catch(() => []),
        api.get<any[]>('/clients').catch(() => []),
        api.get<any[]>('/farms').catch(() => []),
        api.get<any[]>('/orders/executions/all').catch(() => []),
      ]);

      setOrders(Array.isArray(ordersRes) ? ordersRes : []);
      setServicesList(Array.isArray(servicesRes) ? servicesRes : []);
      setCollaborators(Array.isArray(collabsRes) ? collabsRes : []);
      setEquipmentList(Array.isArray(equipRes) ? equipRes : []);
      setClients(Array.isArray(clientsRes) ? clientsRes : []);
      setFarms(Array.isArray(farmsRes) ? farmsRes : []);
      if (Array.isArray(apiExecutionsRes) && apiExecutionsRes.length > 0) {
        setApiExecutions(apiExecutionsRes);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do relatório:", e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Serviços disponíveis dinamicamente (do cadastro e das ordens reais)
  const availableServices = useMemo(() => {
    const set = new Set<string>();
    servicesList.forEach(s => {
      if (s.name) set.add(s.name.trim());
    });
    orders.forEach(o => {
      const name = o.serviceName || o.service_name || o.type;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [servicesList, orders]);

  // 2. Clientes dinâmicos
  const uniqueClients = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => {
      if (c.name) set.add(c.name.trim());
    });
    orders.forEach(o => {
      const name = o.client?.name || o.clientName || o.client_name;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [clients, orders]);

  // 3. Fazendas dinâmicas
  const uniqueFarms = useMemo(() => {
    const set = new Set<string>();
    farms.forEach(f => {
      if (f.name) set.add(f.name.trim());
    });
    orders.forEach(o => {
      const name = o.farm?.name || o.farmName || o.farm_name;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [farms, orders]);

  // 4. Responsáveis dinâmicos
  const uniqueResponsibles = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      const rName = o.responsibleName || o.responsible_name || o.creatorName || o.creator_name;
      if (rName) set.add(rName.trim());
    });
    return Array.from(set).sort();
  }, [orders]);

  // Contagem de filtros secundários ativos
  const activeSecondaryCount = useMemo(() => {
    let count = 0;
    if (clientFilter !== "all") count++;
    if (farmFilter !== "all") count++;
    if (responsibleFilter !== "all") count++;
    if (periodFilter === "custom" && (startDate || endDate)) count++;
    return count;
  }, [clientFilter, farmFilter, responsibleFilter, periodFilter, startDate, endDate]);

  const hasAnyFilter = useMemo(() => {
    return (
      serviceFilter !== "all" ||
      periodFilter !== "all" ||
      statusFilter.length > 0 ||
      activeSecondaryCount > 0
    );
  }, [serviceFilter, periodFilter, statusFilter, activeSecondaryCount]);

  const resetFilters = () => {
    setServiceFilter("all");
    setPeriodFilter("all");
    setStartDate("");
    setEndDate("");
    setStatusFilter([]);
    setClientFilter("all");
    setFarmFilter("all");
    setResponsibleFilter("all");
  };

  // Execuções salvas com prioridade na API do banco de dados
  const savedSplits = useMemo(() => {
    const list: any[] = [];
    if (apiExecutions && apiExecutions.length > 0) {
      apiExecutions.forEach(e => {
        list.push({
          operator: e.operator_name || e.operatorName,
          equipment: e.equipment_name || e.equipmentName,
          areaHa: parseFloat(e.area_ha || e.areaHa) || 0,
          notes: e.notes,
          serviceName: e.service_name || e.serviceName
        });
      });
    }
    try {
      const raw = localStorage.getItem("farm_flow_execution_splits");
      if (raw && list.length === 0) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list.push(...parsed);
      }
    } catch {}
    return list;
  }, [apiExecutions]);

  // Filtro inteligente de pedidos
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      // 1. Status
      const orderStatus = o.status || "Pendente";
      if (statusFilter.length > 0) {
        if (!statusFilter.includes(orderStatus)) return false;
      } else {
        // Por padrão oculta cancelados se nenhum status específico for selecionado
        if (orderStatus === "Cancelado" || orderStatus === "Cancelled") return false;
      }

      // 2. Serviço
      const serviceName = o.serviceName || o.service_name || o.type || "";
      if (serviceFilter !== "all" && serviceName.toLowerCase() !== serviceFilter.toLowerCase()) {
        return false;
      }

      // 3. Cliente
      if (clientFilter !== "all") {
        const cName = o.client?.name || o.clientName || o.client_name || o.clientId || o.client_id || "";
        if (cName.toLowerCase() !== clientFilter.toLowerCase()) return false;
      }

      // 4. Fazenda
      if (farmFilter !== "all") {
        const fName = o.farm?.name || o.farmName || o.farm_name || o.farmId || o.farm_id || "";
        if (fName.toLowerCase() !== farmFilter.toLowerCase()) return false;
      }

      // 5. Responsável
      if (responsibleFilter !== "all") {
        const rName = o.responsibleName || o.responsible_name || o.creatorName || o.creator_name || "";
        if (rName.toLowerCase() !== responsibleFilter.toLowerCase()) return false;
      }

      // 6. Período
      const rawDate = o.created_at || o.createdAt || o.date;
      if (rawDate && periodFilter !== "all") {
        const dt = new Date(rawDate);
        if (!isNaN(dt.getTime())) {
          const diffMs = now.getTime() - dt.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          if (periodFilter === "7d" && diffDays > 7) return false;
          if (periodFilter === "30d" && diffDays > 30) return false;
          if (periodFilter === "month") {
            if (dt.getMonth() !== now.getMonth() || dt.getFullYear() !== now.getFullYear()) return false;
          }
          if (periodFilter === "quarter" && diffDays > 90) return false;
          if (periodFilter === "year") {
            if (dt.getFullYear() !== now.getFullYear()) return false;
          }
          if (periodFilter === "custom") {
            if (startDate) {
              const startD = new Date(startDate);
              startD.setHours(0, 0, 0, 0);
              if (dt < startD) return false;
            }
            if (endDate) {
              const endD = new Date(endDate);
              endD.setHours(23, 59, 59, 999);
              if (dt > endD) return false;
            }
          }
        }
      }

      return true;
    });
  }, [orders, statusFilter, serviceFilter, clientFilter, farmFilter, responsibleFilter, periodFilter, startDate, endDate]);

  const kpiData = useMemo(() => {
    let totalArea = 0;
    let totalValue = 0;
    let completedOrders = 0;
    let inProgressOrders = 0;
    let executedAreaTotal = 0;

    filteredOrders.forEach(o => {
      const area = parseFloat(o.area) || 0;
      const val = parseFloat(o.numericValue || o.value) || 0;
      const execArea = parseFloat(o.executedArea || o.executed_area || "0") || 0;
      totalArea += area;
      totalValue += val;
      executedAreaTotal += execArea;

      const st = (o.status || "").toLowerCase();
      if (st.includes("conclu") || st.includes("finaliz")) {
        completedOrders++;
      } else if (st.includes("andamento") || st.includes("aprovad")) {
        inProgressOrders++;
      }
    });

    return {
      totalOrders: filteredOrders.length,
      completedOrders,
      inProgressOrders,
      totalArea,
      executedAreaTotal,
      totalValue,
      totalAlqueires: totalArea / 2.42,
      executedAlqueires: executedAreaTotal / 2.42
    };
  }, [filteredOrders]);

  const ordersWithApiSplits = useMemo(() => {
    return new Set(
      (apiExecutions || [])
        .map((e: any) => e.order_id || e.orderId)
        .filter(Boolean)
    );
  }, [apiExecutions]);

  const collaboratorProductivity = useMemo(() => {
    const map = new Map<string, { name: string; totalHa: number; ordersCount: number; services: Set<string> }>();

    const creditOperator = (name: string, ha: number, serviceName?: string) => {
      const cleanName = (name || "").trim();
      if (!cleanName) return;
      if (!map.has(cleanName)) {
        map.set(cleanName, { name: cleanName, totalHa: 0, ordersCount: 0, services: new Set() });
      }
      const item = map.get(cleanName)!;
      item.totalHa += ha;
      item.ordersCount += 1;
      if (serviceName) item.services.add(serviceName);
    };

    collaborators.forEach(c => {
      map.set(c.name, { name: c.name, totalHa: 0, ordersCount: 0, services: new Set() });
    });

    savedSplits.forEach((split: any) => {
      creditOperator(split.operator || "Não informado", parseFloat(split.areaHa) || 0, split.serviceName);
    });

    filteredOrders.forEach(o => {
      if (ordersWithApiSplits.has(o.id)) return;
      const serviceName = o.serviceName || o.service_name || o.type || "";
      const schedules = Array.isArray(o.schedules) ? o.schedules : [];
      const latestSchedule = schedules[schedules.length - 1];
      const fallbackOps: string[] = Array.isArray(latestSchedule?.collaborators)
        ? latestSchedule.collaborators
        : latestSchedule?.collaboratorName
        ? [latestSchedule.collaboratorName]
        : o.collaborator
        ? [o.collaborator]
        : [];

      const execs = Array.isArray(o.executions) ? o.executions : [];
      if (execs.length > 0) {
        execs.forEach((exec: any) => {
          if (Array.isArray(exec.splits) && exec.splits.length > 0) {
            exec.splits.forEach((sp: any) => {
              creditOperator(sp.collaboratorName || sp.operator || "Não informado", parseFloat(sp.areaHa) || 0, serviceName);
            });
            return;
          }
          const execHa = parseFloat(exec.areaExecuted ?? exec.hectares ?? exec.executedArea ?? "0") || 0;
          const execOps: string[] = Array.isArray(exec.collaborators) && exec.collaborators.length > 0
            ? exec.collaborators
            : exec.collaboratorName
            ? [exec.collaboratorName]
            : fallbackOps;
          if (execHa > 0 && execOps.length > 0) {
            const share = execHa / execOps.length;
            execOps.forEach(op => creditOperator(op, share, serviceName));
          }
        });
      } else if (o.status === "Concluído" || o.status === "Finalizado" || Number(o.executed_area) > 0) {
        const doneHa = Number(o.executed_area) > 0 ? Number(o.executed_area) : (parseFloat(o.area) || 0);
        if (doneHa > 0 && fallbackOps.length > 0) {
          const share = doneHa / fallbackOps.length;
          fallbackOps.forEach(op => creditOperator(op, share, serviceName));
        }
      }
    });

    return Array.from(map.values())
      .filter((v, idx, arr) => arr.findIndex(x => x.name === v.name) === idx)
      .sort((a, b) => b.totalHa - a.totalHa);
  }, [collaborators, savedSplits, filteredOrders, ordersWithApiSplits]);

  const equipmentUsage = useMemo(() => {
    const map = new Map<string, { name: string; type: string; totalHa: number; usesCount: number; plate?: string }>();

    const creditEquipment = (name: string, ha: number) => {
      const cleanName = (name || "").trim();
      if (!cleanName) return;
      if (!map.has(cleanName)) {
        map.set(cleanName, { name: cleanName, type: "Geral", totalHa: 0, usesCount: 0 });
      }
      const item = map.get(cleanName)!;
      item.totalHa += ha;
      item.usesCount += 1;
    };

    equipmentList.forEach(e => {
      map.set(e.name, {
        name: e.name,
        type: e.type || "Equipamento",
        totalHa: 0,
        usesCount: 0,
        plate: e.plate
      });
    });

    savedSplits.forEach((split: any) => {
      creditEquipment(split.equipment || "Geral", parseFloat(split.areaHa) || 0);
    });

    filteredOrders.forEach(o => {
      if (ordersWithApiSplits.has(o.id)) return;
      const schedules = Array.isArray(o.schedules) ? o.schedules : [];
      const latestSchedule = schedules[schedules.length - 1];
      const fallbackEqs: string[] = Array.isArray(latestSchedule?.equipmentNames)
        ? latestSchedule.equipmentNames
        : latestSchedule?.equipmentName
        ? [latestSchedule.equipmentName]
        : [];

      const execs = Array.isArray(o.executions) ? o.executions : [];
      if (execs.length > 0) {
        execs.forEach((exec: any) => {
          if (Array.isArray(exec.splits) && exec.splits.length > 0) {
            exec.splits.forEach((sp: any) => {
              creditEquipment(sp.equipmentName || sp.equipment || "Geral", parseFloat(sp.areaHa) || 0);
            });
            return;
          }
          const execHa = parseFloat(exec.areaExecuted ?? exec.hectares ?? exec.executedArea ?? "0") || 0;
          const execEqs: string[] = Array.isArray(exec.equipmentNames) && exec.equipmentNames.length > 0
            ? exec.equipmentNames
            : exec.equipmentName
            ? [exec.equipmentName]
            : fallbackEqs;
          if (execHa > 0 && execEqs.length > 0) {
            const share = execHa / execEqs.length;
            execEqs.forEach(eq => creditEquipment(eq, share));
          }
        });
      } else if (o.status === "Concluído" || o.status === "Finalizado" || Number(o.executed_area) > 0) {
        const doneHa = Number(o.executed_area) > 0 ? Number(o.executed_area) : (parseFloat(o.area) || 0);
        if (doneHa > 0 && fallbackEqs.length > 0) {
          const share = doneHa / fallbackEqs.length;
          fallbackEqs.forEach(eq => creditEquipment(eq, share));
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalHa - a.totalHa);
  }, [equipmentList, savedSplits, filteredOrders, ordersWithApiSplits]);

  const serviceBreakdown = useMemo(() => {
    const map = new Map<string, { serviceName: string; totalOrders: number; totalArea: number; totalValue: number }>();

    filteredOrders.forEach(o => {
      const sName = o.serviceName || o.service_name || o.type || "Outro Serviço";
      const area = parseFloat(o.area) || 0;
      const val = parseFloat(o.numericValue || o.value) || 0;

      if (!map.has(sName)) {
        map.set(sName, { serviceName: sName, totalOrders: 0, totalArea: 0, totalValue: 0 });
      }
      const item = map.get(sName)!;
      item.totalOrders += 1;
      item.totalArea += area;
      item.totalValue += val;
    });

    return Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [filteredOrders]);

  // Distribuição Territorial dinâmica baseada nas fazendas e pedidos reais
  const regionalBreakdown = useMemo(() => {
    const map = new Map<string, {
      cityState: string;
      city: string;
      state: string;
      totalFarms: number;
      totalOrders: number;
      totalArea: number;
      totalValue: number;
      farmIds: Set<string>;
      clientIds: Set<string>;
    }>();

    const farmMap = new Map<string, any>();
    farms.forEach(f => {
      if (f.id) farmMap.set(f.id, f);
    });

    filteredOrders.forEach(o => {
      const farm = farmMap.get(o.farmId || o.farm_id) || o.farm;
      const city = (farm?.city || o.city || "Não informada").trim();
      const state = (farm?.state || o.state || "").trim() || "UF não informada";
      const key = `${city} / ${state}`;

      const area = parseFloat(o.area) || 0;
      const val = parseFloat(o.numericValue || o.value) || 0;

      if (!map.has(key)) {
        map.set(key, {
          cityState: key,
          city,
          state,
          totalFarms: 0,
          totalOrders: 0,
          totalArea: 0,
          totalValue: 0,
          farmIds: new Set(),
          clientIds: new Set(),
        });
      }

      const item = map.get(key)!;
      item.totalOrders += 1;
      item.totalArea += area;
      item.totalValue += val;
      if (o.farmId || o.farm_id) item.farmIds.add(o.farmId || o.farm_id);
      if (o.clientId || o.client_id) item.clientIds.add(o.clientId || o.client_id);
      item.totalFarms = item.farmIds.size || 1;
    });

    if (map.size === 0 && farms.length > 0) {
      farms.forEach(f => {
        const city = (f.city || "Não informada").trim();
        const state = (f.state || "").trim() || "UF não informada";
        const key = `${city} / ${state}`;
        const area = parseFloat(f.area) || 0;
        if (!map.has(key)) {
          map.set(key, {
            cityState: key,
            city,
            state,
            totalFarms: 0,
            totalOrders: 0,
            totalArea: 0,
            totalValue: 0,
            farmIds: new Set(),
            clientIds: new Set(),
          });
        }
        const item = map.get(key)!;
        item.totalFarms += 1;
        item.totalArea += area;
      });
    }

    return Array.from(map.values()).sort((a, b) => b.totalArea - a.totalArea);
  }, [filteredOrders, farms]);

  const handleExportCsv = (type: 'collaborators' | 'equipment' | 'services' | 'regional') => {
    let filename = `relatorio_${pdfConfig.companyName ? pdfConfig.companyName.toLowerCase().replace(/[^a-z0-9]/gi, '_') : 'farm_flow'}`;
    let headers: string[] = [];
    let rows: string[][] = [];

    const todayLocal = getLocalDateISO();
    if (type === 'collaborators') {
      filename = `produtividade_equipe_${todayLocal}.csv`;
      headers = ['Colaborador', 'Hectares Executados', 'Alqueires', 'Qtd Execucoes', 'Participacao Percentual'];
      rows = collaboratorProductivity.map(c => [
        `"${c.name}"`,
        c.totalHa.toFixed(2).replace('.', ','),
        (c.totalHa / 2.42).toFixed(2).replace('.', ','),
        c.ordersCount.toString(),
        `"${kpiData.totalArea > 0 ? ((c.totalHa / kpiData.totalArea) * 100).toFixed(1) : '0'}%"`
      ]);
    } else if (type === 'equipment') {
      filename = `uso_equipamentos_${todayLocal}.csv`;
      headers = ['Equipamento', 'Tipo', 'Identificacao Placa', 'Hectares Operados', 'Qtd Atendimentos'];
      rows = equipmentUsage.map(e => [
        `"${e.name}"`,
        `"${e.type}"`,
        `"${e.plate || '-'}"`,
        e.totalHa.toFixed(2).replace('.', ','),
        e.usesCount.toString()
      ]);
    } else if (type === 'services') {
      filename = `volume_servicos_${todayLocal}.csv`;
      headers = ['Servico', 'Qtd Ordens', 'Area Total Hectares', 'Area Alqueires', 'Faturamento Total R$', 'Ticket Medio R$/ha'];
      rows = serviceBreakdown.map(s => [
        `"${s.serviceName}"`,
        s.totalOrders.toString(),
        s.totalArea.toFixed(2).replace('.', ','),
        (s.totalArea / 2.42).toFixed(2).replace('.', ','),
        s.totalValue.toFixed(2).replace('.', ','),
        (s.totalArea > 0 ? (s.totalValue / s.totalArea) : 0).toFixed(2).replace('.', ',')
      ]);
    } else {
      filename = `distribuicao_regional_${todayLocal}.csv`;
      headers = ['Municipio e UF', 'Fazendas Atendidas', 'Qtd Ordens', 'Area Total Hectares', 'Area Alqueires', 'Faturamento Total R$'];
      rows = regionalBreakdown.map(r => [
        `"${r.cityState}"`,
        r.totalFarms.toString(),
        r.totalOrders.toString(),
        r.totalArea.toFixed(2).replace('.', ','),
        (r.totalArea / 2.42).toFixed(2).replace('.', ','),
        r.totalValue.toFixed(2).replace('.', ',')
      ]);
    }

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 print:space-y-4 print:text-black">
      {/* Cabeçalho Oficial exclusivo para Impressão - 100% Dinâmico com as Configurações da Empresa */}
      <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-black mb-4">
        <div className="flex items-center gap-3">
          {pdfConfig.logoUrl ? (
            <img src={pdfConfig.logoUrl} alt="Logo" className="h-10 object-contain max-w-[120px]" />
          ) : (
            <div className="font-black text-2xl tracking-wider text-black">{pdfConfig.companyName || "FARM FLOW"}</div>
          )}
          <div>
            <div className="font-bold text-sm text-black">{pdfConfig.companyName || "FARM FLOW"}</div>
            <div className="text-xs text-gray-700">{pdfConfig.tagline || "Relatório Operacional e de Produtividade"}</div>
            {pdfConfig.cnpj && (
              <div className="text-[10px] text-gray-500">
                CNPJ: {pdfConfig.cnpj} {pdfConfig.phone ? `• Tel: ${pdfConfig.phone}` : ''}
              </div>
            )}
          </div>
        </div>
        <div className="text-right text-xs text-gray-700">
          <div>
            Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] text-gray-500">{pdfConfig.versionCode || "Sistema de Gestão Agrícola"}</div>
        </div>
      </div>

      {/* Topo da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            Relatórios Operacionais & Auditoria de Campo
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhamento de produtividade por operador, uso de maquinário, volumes executados e faturamento.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportCsv('services')} className="gap-1.5 shadow-sm">
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            Exportar Excel / CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 shadow-sm">
            <Printer className="h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* Painel de Filtros Avançados Dinâmico */}
      <Card className="print:hidden bg-muted/20 border">
        <CardContent className="pt-4 space-y-3">
          {/* Barra Principal (sempre visível) */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
            {/* Serviço Dinâmico */}
            <div className="w-full sm:w-56">
              <span className="text-xs font-semibold text-muted-foreground block mb-1">Serviço:</span>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="text-xs bg-background h-9">
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Serviços</SelectItem>
                  {availableServices.map((srv) => (
                    <SelectItem key={srv} value={srv}>{srv}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período Dinâmico */}
            <div className="w-full sm:w-56">
              <span className="text-xs font-semibold text-muted-foreground block mb-1">Período:</span>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="text-xs bg-background h-9">
                  <SelectValue placeholder="Histórico Completo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Histórico Completo</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="month">Mês Atual ({format(new Date(), 'MMMM yyyy', { locale: ptBR })})</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Safra Atual ({currentYear}/{currentYear + 1})</SelectItem>
                  <SelectItem value="custom">Personalizado (Datas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status com Multi-Seleção */}
            <div className="w-full sm:w-48">
              <span className="text-xs font-semibold text-muted-foreground block mb-1">Status:</span>
              <MultiStatusFilter
                placeholder="Status"
                options={[
                  { value: "Pendente", label: "Pendente" },
                  { value: "Agendado", label: "Agendado" },
                  { value: "Em Andamento", label: "Em Andamento" },
                  { value: "Concluído", label: "Concluído" },
                  { value: "Cancelado", label: "Cancelado" },
                ]}
                selected={statusFilter}
                onChange={setStatusFilter}
                triggerClassName="w-full h-9 text-xs"
              />
            </div>

            {/* Botão Acordeon Mais Filtros */}
            <div className="flex items-end self-end">
              <Button
                type="button"
                variant={showMoreFilters || activeSecondaryCount > 0 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowMoreFilters(prev => !prev)}
                className="h-9 text-xs gap-1.5 shrink-0"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Mais Filtros</span>
                {activeSecondaryCount > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-primary/10 text-primary font-bold">
                    {activeSecondaryCount}
                  </Badge>
                )}
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", showMoreFilters && "rotate-180")} />
              </Button>
            </div>

            {/* Botão Limpar Filtros */}
            {hasAnyFilter && (
              <div className="flex items-end self-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Limpar
                </Button>
              </div>
            )}
          </div>

          {/* Acordeon Colapsável de Filtros Secundários */}
          {showMoreFilters && (
            <div className="pt-3 mt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs font-semibold">Cliente</Label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="mt-1 text-xs bg-background h-9">
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {uniqueClients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Fazenda</Label>
                <Select value={farmFilter} onValueChange={setFarmFilter}>
                  <SelectTrigger className="mt-1 text-xs bg-background h-9">
                    <SelectValue placeholder="Todas as fazendas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as fazendas</SelectItem>
                    {uniqueFarms.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Responsável</Label>
                <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                  <SelectTrigger className="mt-1 text-xs bg-background h-9">
                    <SelectValue placeholder="Todos os responsáveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os responsáveis</SelectItem>
                    {uniqueResponsibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {periodFilter === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-semibold">De:</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 text-xs bg-background h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Até:</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 text-xs bg-background h-9"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-emerald-800">
              Área Total Coberta
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-950">
              {kpiData.totalArea.toFixed(2)} ha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-700 font-medium">
              Equivalente a {kpiData.totalAlqueires.toFixed(2)} alqueires
            </span>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-blue-800">
              Faturamento Filtrado
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-950">
              {formatCurrency(kpiData.totalValue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-blue-700 font-medium">
              Em {kpiData.totalOrders} ordens de serviço
            </span>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-purple-800">
              Serviços Concluídos
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-950">
              {kpiData.completedOrders} / {kpiData.totalOrders}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-purple-700 font-medium">
              {kpiData.totalOrders > 0 ? ((kpiData.completedOrders / kpiData.totalOrders) * 100).toFixed(1) : 0}% de taxa de entrega
            </span>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-amber-800">
              Recursos de Campo
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-950">
              {collaborators.length} operadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-amber-700 font-medium">
              {equipmentList.length} máquinas e veículos
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Abas Temáticas de Relatórios */}
      <Tabs defaultValue="collaborators" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto w-full gap-1 print:hidden">
          <TabsTrigger value="collaborators" className="gap-1.5 text-xs py-2">
            <Users className="h-4 w-4" />
            Produtividade da Equipe
          </TabsTrigger>
          <TabsTrigger value="equipment" className="gap-1.5 text-xs py-2">
            <Truck className="h-4 w-4" />
            Uso de Equipamentos
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-1.5 text-xs py-2">
            <TrendingUp className="h-4 w-4" />
            Volume por Serviço
          </TabsTrigger>
          <TabsTrigger value="regional" className="gap-1.5 text-xs py-2">
            <MapPin className="h-4 w-4" />
            Distribuição Regional
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs py-2">
            <ShieldCheck className="h-4 w-4" />
            Auditoria do Sistema
          </TabsTrigger>
        </TabsList>

        {/* 1. Produtividade da Equipe */}
        <TabsContent value="collaborators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Desempenho e Hectares Executados por Operador</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Baseado nas execuções de campo da Agenda
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador / Operador</TableHead>
                    <TableHead>Área Executada (ha)</TableHead>
                    <TableHead>Área em Alqueires</TableHead>
                    <TableHead>Serviços Atendidos</TableHead>
                    <TableHead className="text-right">Participação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaboratorProductivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhum operador com execuções registradas</p>
                          <p className="text-xs text-muted-foreground">
                            As métricas de produtividade são geradas a partir das execuções concluídas na Agenda.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    collaboratorProductivity.map((collab, idx) => {
                      const percent = kpiData.totalArea > 0 ? ((collab.totalHa / kpiData.totalArea) * 100).toFixed(1) : "0.0";
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-emerald-950 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {collab.name}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-sm">{collab.totalHa.toFixed(2)} ha</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {(collab.totalHa / 2.42).toFixed(2)} alq
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {collab.ordersCount} execução(ões)
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-xs font-semibold bg-muted px-2 py-1 rounded">
                              {percent}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Uso de Equipamentos */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Horímetro e Hectares Operados por Equipamento / Veículo</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Rastreabilidade da frota e maquinário de precisão
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Identificação / Placa</TableHead>
                    <TableHead>Hectares Operados</TableHead>
                    <TableHead className="text-right">Atendimentos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentUsage.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Truck className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhum equipamento com uso registrado</p>
                          <p className="text-xs text-muted-foreground">
                            Vincule máquinas e veículos aos agendamentos ou execuções para rastrear horas e área operada.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    equipmentUsage.map((eq, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{eq.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-normal">
                            {eq.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {eq.plate ? (
                            <code className="text-xs font-mono font-bold bg-muted px-1.5 py-0.5 rounded">
                              {eq.plate}
                            </code>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-sm">
                          {eq.totalHa.toFixed(2)} ha
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs bg-muted px-2 py-1 rounded font-semibold">
                            {eq.usesCount} vez(es)
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Volume por Serviço */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Volume Executado e Faturamento por Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço Oficial</TableHead>
                    <TableHead>Qtd Ordens</TableHead>
                    <TableHead>Área Total (ha)</TableHead>
                    <TableHead>Área em Alqueires</TableHead>
                    <TableHead>Faturamento Total</TableHead>
                    <TableHead className="text-right">Ticket Médio/ha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceBreakdown.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhum serviço encontrado</p>
                          <p className="text-xs text-muted-foreground">
                            Nenhum pedido atende aos filtros de serviço e período selecionados.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    serviceBreakdown.map((s, idx) => {
                      const avgPerHa = s.totalArea > 0 ? (s.totalValue / s.totalArea) : 0;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-emerald-950">
                            {s.serviceName}
                          </TableCell>
                          <TableCell>{s.totalOrders}</TableCell>
                          <TableCell className="font-bold">{s.totalArea.toFixed(2)} ha</TableCell>
                          <TableCell className="text-muted-foreground">
                            {(s.totalArea / 2.42).toFixed(2)} alq
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {formatCurrency(s.totalValue)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatCurrency(avgPerHa)}/ha
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Distribuição Territorial */}
        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição Territorial das Fazendas, Pedidos e Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Município / UF</TableHead>
                    <TableHead>Fazendas Atendidas</TableHead>
                    <TableHead>Qtd Ordens</TableHead>
                    <TableHead>Área Total (ha)</TableHead>
                    <TableHead>Área em Alqueires</TableHead>
                    <TableHead className="text-right">Faturamento Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionalBreakdown.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <MapPin className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhuma propriedade com dados regionais</p>
                          <p className="text-xs text-muted-foreground">
                            Cadastre municípios e estados nas fazendas para visualizar o raio de cobertura da empresa.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    regionalBreakdown.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{r.cityState}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {r.totalFarms} propriedade(s)
                          </Badge>
                        </TableCell>
                        <TableCell>{r.totalOrders}</TableCell>
                        <TableCell className="font-bold">{r.totalArea.toFixed(2)} ha</TableCell>
                        <TableCell className="text-muted-foreground">
                          {(r.totalArea / 2.42).toFixed(2)} alq
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(r.totalValue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Auditoria do Sistema */}
        <TabsContent value="audit" className="space-y-4">
          <AuditLogsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;

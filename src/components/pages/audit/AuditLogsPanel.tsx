import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "@/services/api";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import { getLocalDateISO } from "@/lib/utils";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  Clock,
  User,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export interface AuditFieldChange {
  field: string;
  label: string;
  before: any;
  after: any;
}

export interface AuditLogItem {
  id: string;
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  module: string;
  action: string;
  entity_id?: string | null;
  entity_label?: string | null;
  summary: string;
  changes?: AuditFieldChange[] | null;
  before_data?: Record<string, any> | null;
  after_data?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export const AUDIT_MODULE_LABELS: Record<string, string> = {
  orders: "Pedidos",
  clients: "Clientes",
  farms: "Fazendas / Talhões",
  financial: "Financeiro",
  analyses: "Análises",
  users: "Usuários e Permissões",
  sessions: "Autenticação / Login",
  services: "Serviços",
  service_groups: "Grupos de Serviços",
  products: "Produtos",
  equipment: "Equipamentos",
  collaborators: "Colaboradores",
  cost_variables: "Variáveis de Custo",
};

export const AUDIT_ACTION_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  CREATE: { label: "Criação", badgeClass: "bg-blue-100 text-blue-800 border-blue-200" },
  UPDATE: { label: "Edição", badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  DELETE: { label: "Exclusão", badgeClass: "bg-red-100 text-red-800 border-red-200" },
  LOGIN: { label: "Login", badgeClass: "bg-slate-100 text-slate-800 border-slate-200" },
  APPROVE: { label: "Aprovação", badgeClass: "bg-green-100 text-green-800 border-green-200" },
  CANCEL: { label: "Cancelamento", badgeClass: "bg-rose-100 text-rose-800 border-rose-200" },
  EXECUTION: { label: "Execução", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  SCHEDULE: { label: "Agendamento", badgeClass: "bg-purple-100 text-purple-800 border-purple-200" },
  PAYMENT: { label: "Pagamento", badgeClass: "bg-amber-100 text-amber-800 border-amber-200" },
};

const formatDateTimeBR = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const AuditLogsPanel: React.FC = () => {
  const queryClient = useSafeQueryClient();
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const startDateParam = startDate ? new Date(`${startDate}T00:00:00`).toISOString() : "";
  const endDateParam = endDate ? new Date(`${endDate}T23:59:59.999`).toISOString() : "";

  const queryParams = new URLSearchParams({
    module: moduleFilter,
    action: actionFilter,
    search: searchTerm,
    startDate: startDateParam,
    endDate: endDateParam,
    page: String(page),
    limit: "20",
  }).toString();

  const { data, isLoading, isFetching } = useQuery<{
    items: AuditLogItem[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ["audit-logs", moduleFilter, actionFilter, searchTerm, startDate, endDate, page],
    queryFn: async () => {
      return api.get(`/audit-logs?${queryParams}`);
    },
  }, queryClient);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleClearFilters = () => {
    setModuleFilter("all");
    setActionFilter("all");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
  };

  const handleExportCSV = () => {
    const headers = ["Data/Hora", "Usuário", "Email", "Cargo", "Módulo", "Ação", "Registro", "Resumo", "IP"];
    const rows = items.map((item) => [
      formatDateTimeBR(item.created_at),
      item.user_name || "Sistema",
      item.user_email || "-",
      item.user_role || "-",
      AUDIT_MODULE_LABELS[item.module] || item.module,
      AUDIT_ACTION_CONFIG[item.action]?.label || item.action,
      item.entity_label || item.entity_id || "-",
      `"${(item.summary || "").replace(/"/g, '""')}"`,
      item.ip_address || "-",
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `auditoria_sistema_${getLocalDateISO()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    const cfg = AUDIT_ACTION_CONFIG[action] || {
      label: action,
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
      <Badge variant="outline" className={`whitespace-nowrap text-[11px] font-medium ${cfg.badgeClass}`}>
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Auditoria Global do Sistema</CardTitle>
                <CardDescription className="text-xs">
                  Trilha imutável de criação, edição, exclusão, permissões e logins por usuário
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching} className="gap-1.5 text-xs">
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={items.length === 0} className="gap-1.5 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-slate-50 border">
            <div className="w-full sm:flex-1 sm:min-w-[210px]">
              <Label className="text-xs font-semibold">Busca</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Usuário, resumo, registro..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 h-9 text-xs bg-white"
                />
              </div>
            </div>

            <div className="w-full sm:w-[170px]">
              <Label className="text-xs font-semibold">Módulo</Label>
              <Select
                value={moduleFilter}
                onValueChange={(v) => {
                  setModuleFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="mt-1 h-9 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Módulos</SelectItem>
                  {Object.entries(AUDIT_MODULE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[150px]">
              <Label className="text-xs font-semibold">Ação</Label>
              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="mt-1 h-9 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  {Object.entries(AUDIT_ACTION_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[calc(50%-0.375rem)] sm:w-[140px]">
              <Label className="text-xs font-semibold">De</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="mt-1 h-9 text-xs bg-white"
              />
            </div>

            <div className="w-[calc(50%-0.375rem)] sm:w-[140px]">
              <Label className="text-xs font-semibold">Até</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="mt-1 h-9 text-xs bg-white"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Limpar filtros"
              aria-label="Limpar filtros"
              className="h-9 w-9 shrink-0 bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Carregando trilha de auditoria...</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhum registro de auditoria encontrado para os filtros atuais.
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border bg-white space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{item.user_name || "Sistema"}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {AUDIT_MODULE_LABELS[item.module] || item.module} • {formatDateTimeBR(item.created_at)}
                        </p>
                      </div>
                      {getActionBadge(item.action)}
                    </div>
                    {item.entity_label && (
                      <p className="font-medium text-slate-700">{item.entity_label}</p>
                    )}
                    <p className="text-slate-600">{item.summary}</p>
                    <div className="pt-1 flex justify-end">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedLog(item)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data / Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Registro & Resumo</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTimeBR(item.created_at)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium text-slate-900">{item.user_name || "Sistema"}</div>
                          <div className="text-[11px] text-muted-foreground">{item.user_role || item.user_email || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[11px] font-normal whitespace-nowrap">
                            {AUDIT_MODULE_LABELS[item.module] || item.module}
                          </Badge>
                        </TableCell>
                        <TableCell>{getActionBadge(item.action)}</TableCell>
                        <TableCell className="max-w-md text-xs">
                          {item.entity_label && (
                            <div className="font-semibold text-slate-800 truncate">{item.entity_label}</div>
                          )}
                          <div className="text-slate-600 line-clamp-2">{item.summary}</div>
                          {Array.isArray(item.changes) && item.changes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.changes.slice(0, 2).map((chg, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700"
                                >
                                  <strong>{chg.label}:</strong> {String(chg.before)} → {String(chg.after)}
                                </span>
                              ))}
                              {item.changes.length > 2 && (
                                <span className="text-[10px] text-muted-foreground self-center">
                                  +{item.changes.length - 2} campo(s)
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Visualizar detalhes da auditoria"
                            onClick={() => setSelectedLog(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                <span>
                  Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total} registro(s)
                </span>
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(Math.max(1, page - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink isActive>{page} / {totalPages}</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes de Auditoria */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => { if (!open) setSelectedLog(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              Detalhes do Evento de Auditoria
            </DialogTitle>
            <DialogDescription>
              Registro completo imutável de quem executou a ação e valores antes/depois
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border">
                  <div>
                    <span className="text-muted-foreground block">Responsável</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                      {selectedLog.user_name || "Sistema"} ({selectedLog.user_role || "-"})
                    </span>
                    {selectedLog.user_email && (
                      <span className="text-[11px] text-muted-foreground">{selectedLog.user_email}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Data / Hora & Origem</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTimeBR(selectedLog.created_at)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      IP: {selectedLog.ip_address || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Módulo / Ação</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="secondary">{AUDIT_MODULE_LABELS[selectedLog.module] || selectedLog.module}</Badge>
                      {getActionBadge(selectedLog.action)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Registro Afetado</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {selectedLog.entity_label || "-"}
                    </span>
                    {selectedLog.entity_id && (
                      <span className="font-mono text-[10px] text-muted-foreground">{selectedLog.entity_id}</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Resumo</h4>
                  <p className="p-2.5 rounded border bg-white text-slate-700">{selectedLog.summary}</p>
                </div>

                {Array.isArray(selectedLog.changes) && selectedLog.changes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1.5">Campos Alterados (Antes → Depois)</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campo</TableHead>
                            <TableHead>Valor Anterior</TableHead>
                            <TableHead></TableHead>
                            <TableHead>Novo Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedLog.changes.map((chg, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{chg.label}</TableCell>
                              <TableCell className="text-rose-700 bg-rose-50/50">{String(chg.before)}</TableCell>
                              <TableCell className="w-6 text-center">
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground inline" />
                              </TableCell>
                              <TableCell className="text-emerald-700 bg-emerald-50/50 font-medium">
                                {String(chg.after)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {(selectedLog.before_data || selectedLog.after_data) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLog.before_data && (
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-1">Snapshot Antes</h4>
                        <pre className="p-2.5 rounded border bg-slate-950 text-slate-100 text-[11px] overflow-x-auto max-h-56">
                          {JSON.stringify(selectedLog.before_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.after_data && (
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-1">Snapshot Depois</h4>
                        <pre className="p-2.5 rounded border bg-slate-950 text-slate-100 text-[11px] overflow-x-auto max-h-56">
                          {JSON.stringify(selectedLog.after_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


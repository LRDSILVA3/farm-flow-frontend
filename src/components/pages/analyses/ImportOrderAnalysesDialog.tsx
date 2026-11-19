import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FlaskConical, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { getLocalDateISO } from "@/lib/utils";

interface ImportOrderAnalysesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAnalyses: Array<{
    id: string;
    orderId?: string;
    analysisName: string;
    quantity: number;
    executionId?: string;
  }>;
  laboratories: Array<{ id: string; name: string }>;
  onImported: () => void;
}

interface ContractedItem {
  code: string;
  label: string;
  contracted: number;
  alreadyImported: number;
  remaining: number;
}

const normalizeAnalysisType = (p: any): { code: string; label: string } | null => {
  const id = (p.id || "").toLowerCase();
  const type = (p.type || "").toUpperCase();
  const name = (p.name || "").toUpperCase();

  if (id.startsWith("servico_") || type.startsWith("SERVICO_") || p.unit === "ALQ") {
    return null;
  }

  if (id === "analises_bioas" || type === "BIOAS" || name.includes("BIOAS")) {
    return { code: "ANÁLISE BIOAS", label: "ANÁLISE BIOAS (Biológica do Solo)" };
  }
  if (id === "analises_20_40" || type === "MACRO+S" || name.includes("20-40")) {
    return { code: "MACRO+S", label: "MACRO+S (Profundidade 20-40 cm)" };
  }
  if (id === "analise_fisica" || type === "FISICA" || name.includes("FÍSICA") || name.includes("FISICA")) {
    return { code: "ANÁLISE FÍSICA", label: "ANÁLISE FÍSICA (Granulometria / Textura)" };
  }
  if (id === "analise_foliar" || type.includes("FOLIAR") || name.includes("FOLIAR")) {
    return { code: "ANALISE DE FOLIAR", label: "ANALISE DE FOLIAR (Nutrição Foliar)" };
  }
  if (
    id === "analises_completa" ||
    id === "analises_macro_prem" ||
    type === "MACRO+S+P_REM" ||
    name.includes("COMPLETA") ||
    name.includes("P_REM") ||
    name.includes("P-REM")
  ) {
    return { code: "MACRO+S+P_REM", label: "MACRO+S+P_REM (Completa)" };
  }
  if (id === "analises_macro" || type === "MACRO" || name.includes("SIMPLES") || name.includes("MACRO")) {
    return { code: "MACRO", label: "MACRO (Análise Simples)" };
  }
  if (p.unit === "PTOS" || name.includes("ANÁLISE") || name.includes("ANALISE")) {
    return { code: p.name || "MACRO+S+P_REM", label: p.name || "Análise de Solo" };
  }
  return null;
};

export const ImportOrderAnalysesDialog: React.FC<ImportOrderAnalysesDialogProps> = ({
  open,
  onOpenChange,
  existingAnalyses,
  laboratories,
  onImported,
}) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>("all");
  const [selectedPlotId, setSelectedPlotId] = useState<string>("geral");
  const [laboratory, setLaboratory] = useState<string>(
    laboratories[0]?.name || "Laboratório Solo Forte"
  );
  const [sendDate, setSendDate] = useState<string>(getLocalDateISO());
  const [status, setStatus] = useState<string>("Enviado");
  const [importQuantities, setImportQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      fetchOrders();
      setSelectedOrderId("");
      setSelectedExecutionId("all");
      setSelectedPlotId("geral");
      setImportQuantities({});
      setSendDate(getLocalDateISO());
      setStatus("Enviado");
    }
  }, [open]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.get<any[]>("/orders").catch(() => []);
      if (Array.isArray(data)) {
        // Filtra pedidos de amostragem/conferência/foliar que não estão cancelados
        const eligible = data.filter((o) => {
          if ((o.status || "").toLowerCase() === "cancelado") return false;
          const combined = `${o.service_name || o.serviceName || ""} ${o.type || ""}`.toLowerCase();
          const hasAnalysisType =
            combined.includes("amostr") ||
            combined.includes("solo") ||
            combined.includes("confer") ||
            combined.includes("foliar") ||
            combined.includes("folha") ||
            combined.includes("ap");
          const hasAnalysisProducts =
            Array.isArray(o.products_data || o.productsData) &&
            (o.products_data || o.productsData).some((p: any) => normalizeAnalysisType(p) !== null);
          return hasAnalysisType || hasAnalysisProducts;
        });
        setOrders(eligible);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  // Execuções de campo registradas neste pedido (incluindo parciais)
  const orderExecutions = useMemo(() => {
    if (!selectedOrder) return [];
    const execs = selectedOrder.executions;
    return Array.isArray(execs) ? execs : [];
  }, [selectedOrder]);

  // Talhões disponíveis no pedido ou na execução selecionada
  const orderPlots = useMemo(() => {
    if (!selectedOrder) return [];
    const list: Array<{ id: string; name: string }> = [];

    if (selectedExecutionId !== "all") {
      const exec = orderExecutions.find((e: any) => e.id === selectedExecutionId);
      if (exec && Array.isArray(exec.plotExecutions)) {
        exec.plotExecutions.forEach((pe: any) => {
          if (pe.plotName && !list.some((x) => x.name === pe.plotName)) {
            list.push({ id: pe.plotId || pe.plotName, name: pe.plotName });
          }
        });
      }
    }

    const rawPlots = selectedOrder.plots || [];
    if (Array.isArray(rawPlots)) {
      rawPlots.forEach((p: any, idx: number) => {
        const name = typeof p === "string" ? p : p?.name;
        const id = typeof p === "string" ? `plot-${idx}` : p?.id || `plot-${idx}`;
        if (name && !list.some((x) => x.name === name)) {
          list.push({ id, name });
        }
      });
    }
    return list;
  }, [selectedOrder, selectedExecutionId, orderExecutions]);

  // Mapeia os itens de análise contratados vs já importados para o pedido selecionado
  const contractedItems: ContractedItem[] = useMemo(() => {
    if (!selectedOrder) return [];
    const rawProducts = selectedOrder.products_data || selectedOrder.productsData || [];
    const grouped = new Map<string, { label: string; contracted: number }>();

    if (Array.isArray(rawProducts)) {
      rawProducts.forEach((p: any) => {
        const norm = normalizeAnalysisType(p);
        if (!norm) return;
        const qty = Number(p.quantity) || 0;
        if (qty <= 0) return;
        const prev = grouped.get(norm.code) || { label: norm.label, contracted: 0 };
        prev.contracted += qty;
        grouped.set(norm.code, prev);
      });
    }

    // Se o pedido não tinha products_data discriminado, cria um item padrão com totalSamples ou executado
    if (grouped.size === 0) {
      const combined = `${selectedOrder.service_name || selectedOrder.serviceName || ""} ${selectedOrder.type || ""}`.toLowerCase();
      const defaultCode = combined.includes("foliar") ? "ANALISE DE FOLIAR" : "MACRO+S+P_REM";
      const defaultLabel = combined.includes("foliar")
        ? "ANALISE DE FOLIAR (Nutrição Foliar)"
        : "MACRO+S+P_REM (Completa)";
      const fallbackQty =
        Number(selectedOrder.total_samples || selectedOrder.totalSamples) ||
        orderExecutions.reduce((s: number, e: any) => s + (Number(e.samplesExecuted) || 0), 0) ||
        1;
      grouped.set(defaultCode, { label: defaultLabel, contracted: fallbackQty });
    }

    // Soma o que já foi importado em /analyses para este order_id
    const importedMap = new Map<string, number>();
    existingAnalyses
      .filter((a) => a.orderId === selectedOrder.id)
      .forEach((a) => {
        const key = a.analysisName;
        importedMap.set(key, (importedMap.get(key) || 0) + (Number(a.quantity) || 0));
      });

    return Array.from(grouped.entries()).map(([code, info]) => {
      const alreadyImported = importedMap.get(code) || 0;
      const remaining = Math.max(0, info.contracted - alreadyImported);
      return {
        code,
        label: info.label,
        contracted: info.contracted,
        alreadyImported,
        remaining,
      };
    });
  }, [selectedOrder, existingAnalyses, orderExecutions]);

  // Recalcula sugestões de quantidade quando muda o pedido ou a etapa parcial selecionada
  useEffect(() => {
    if (!selectedOrder || contractedItems.length === 0) {
      setImportQuantities({});
      return;
    }

    const next: Record<string, number> = {};

    if (selectedExecutionId !== "all") {
      const exec = orderExecutions.find((e: any) => e.id === selectedExecutionId);
      const execSamples = Number(exec?.samplesExecuted) || 0;

      if (execSamples > 0) {
        // Distribui proporcionalmente ou preenche até o limite do saldo de cada tipo
        let leftToAllocate = execSamples;
        contractedItems.forEach((item) => {
          if (leftToAllocate <= 0) {
            next[item.code] = 0;
          } else {
            const alloc = Math.min(item.remaining, leftToAllocate);
            next[item.code] = alloc;
            leftToAllocate -= alloc;
          }
        });
      } else {
        // Execução parcial sem amostras informadas: sugere proporcional à % da área executada na etapa
        const orderArea = parseFloat(selectedOrder.area || "0") || 0;
        const execArea = Number(exec?.areaExecuted || exec?.hectares) || 0;
        const ratio = orderArea > 0 && execArea > 0 ? Math.min(1, execArea / orderArea) : 1;
        contractedItems.forEach((item) => {
          const suggested = Math.min(item.remaining, Math.max(0, Math.round(item.contracted * ratio)));
          next[item.code] = suggested;
        });
      }
    } else {
      // Modo saldo geral do pedido: sugere o saldo restante de cada tipo
      contractedItems.forEach((item) => {
        next[item.code] = item.remaining;
      });
    }

    setImportQuantities(next);
  }, [selectedOrderId, selectedExecutionId, contractedItems, orderExecutions, selectedOrder]);

  const totalToImportNow = useMemo(
    () => Object.values(importQuantities).reduce((sum, q) => sum + (Number(q) || 0), 0),
    [importQuantities]
  );

  const handleConfirmImport = async () => {
    if (!selectedOrder) return;

    const itemsToCreate = contractedItems
      .map((item) => ({
        code: item.code,
        quantity: Number(importQuantities[item.code]) || 0,
      }))
      .filter((i) => i.quantity > 0);

    if (itemsToCreate.length === 0) {
      toast({
        title: "Nenhuma quantidade selecionada",
        description: "Informe pelo menos 1 amostra para importar.",
        variant: "destructive",
      });
      return;
    }

    const clientName = selectedOrder.client?.name || selectedOrder.client_name || "Cliente";
    const farmName = selectedOrder.farm?.name || selectedOrder.farm_name || "Fazenda";
    const farmId = selectedOrder.farm_id || selectedOrder.farm?.id || null;
    const plotObj = orderPlots.find((p) => p.id === selectedPlotId);
    const plotId = selectedPlotId !== "geral" && plotObj ? plotObj.id : null;
    const plotName = plotObj ? plotObj.name : "Geral";
    const isPartial =
      selectedExecutionId !== "all" ||
      (selectedOrder.status || "").toLowerCase() === "em andamento" ||
      contractedItems.some((item) => (importQuantities[item.code] || 0) < item.remaining);

    setSubmitting(true);
    try {
      await Promise.all(
        itemsToCreate.map((item) =>
          api.post("/analyses", {
            order_id: selectedOrder.id,
            farm_id: farmId,
            plot_id: plotId,
            type: item.code,
            status,
            date: sendDate,
            results: {
              collaborator: laboratory,
              quantity: item.quantity,
              clientName,
              farmName,
              plotName,
              orderService: selectedOrder.service_name || selectedOrder.type || "Amostragem",
              executionId: selectedExecutionId !== "all" ? selectedExecutionId : undefined,
              isPartialImport: isPartial,
            },
          })
        )
      );

      toast({
        title: "Análises importadas com sucesso!",
        description: `${totalToImportNow} amostras (${itemsToCreate.length} ${
          itemsToCreate.length === 1 ? "tipo" : "tipos"
        }) vinculadas ao pedido de ${clientName}.`,
      });

      onImported();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao importar análises",
        description: error.message || "Falha ao salvar análises do pedido.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-emerald-600" />
            Importar Análises de Pedido / Serviço (Total ou Parcial)
          </DialogTitle>
          <DialogDescription>
            Selecione um pedido em andamento (parcial) ou concluído para enviar as amostras
            coletadas ao laboratório, mantendo o controle de saldo por tipo de análise e talhão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Seleção do Pedido */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              1. Selecione o Pedido / Serviço <span className="text-red-500">*</span>
            </Label>
            {loadingOrders ? (
              <div className="flex items-center gap-2 p-3 border rounded-md text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando pedidos de amostragem...
              </div>
            ) : (
              <Select
                value={selectedOrderId}
                onValueChange={(val) => {
                  setSelectedOrderId(val);
                  setSelectedExecutionId("all");
                  setSelectedPlotId("geral");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um pedido em andamento (parcial) ou concluído..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum pedido de análise encontrado
                    </SelectItem>
                  ) : (
                    orders.map((o) => {
                      const cName = o.client?.name || o.client_name || "Cliente";
                      const fName = o.farm?.name || o.farm_name || "Fazenda";
                      const sName = o.service_name || o.serviceName || o.type;
                      const area = parseFloat(o.area || "0") || 0;
                      const execArea = Number(o.executed_area || o.executedArea) || 0;
                      const pct = area > 0 ? Math.min(100, Math.round((execArea / area) * 100)) : 0;
                      return (
                        <SelectItem key={o.id} value={o.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {cName} • {fName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({sName} • {o.status} {pct > 0 ? `${pct}%` : ""})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedOrder && (
            <>
              {/* Resumo do Pedido + Seletor de Etapa Parcial e Talhão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md border bg-muted/25">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
                    2. Origem / Etapa de Execução:
                  </Label>
                  <Select
                    value={selectedExecutionId}
                    onValueChange={(val) => {
                      setSelectedExecutionId(val);
                      setSelectedPlotId("geral");
                    }}
                  >
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Saldo Geral do Pedido (todas as amostras restantes)
                      </SelectItem>
                      {orderExecutions.map((ex: any, idx: number) => {
                        const alreadyImportedExec = existingAnalyses.some(
                          (a) => a.executionId === ex.id
                        );
                        const plotsLabel =
                          Array.isArray(ex.plotExecutions) && ex.plotExecutions.length > 0
                            ? ` • ${ex.plotExecutions.map((p: any) => p.plotName).join(", ")}`
                            : "";
                        return (
                          <SelectItem key={ex.id || idx} value={ex.id || String(idx)}>
                            Etapa {idx + 1} ({ex.date}) • {ex.areaExecuted || ex.hectares} ha
                            {ex.samplesExecuted ? ` • ${ex.samplesExecuted} pts` : ""}
                            {plotsLabel}
                            {alreadyImportedExec ? " [Já importada]" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    3. Talhão da Remessa (opcional):
                  </Label>
                  <Select value={selectedPlotId} onValueChange={setSelectedPlotId}>
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Todos / Geral da Fazenda</SelectItem>
                      {orderPlots.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabela de Conferência e Quantidades a Importar */}
              <div className="border rounded-md overflow-hidden">
                <div className="px-3 py-2 bg-emerald-50/70 border-b flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-950">
                    Grade de Análises do Pedido (Ajuste as quantidades para importação parcial)
                  </span>
                  <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300 text-xs">
                    Importando agora: {totalToImportNow} amostras
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead>Tipo de Análise</TableHead>
                      <TableHead className="text-center">Contratado</TableHead>
                      <TableHead className="text-center">Já Importado</TableHead>
                      <TableHead className="text-center">Saldo</TableHead>
                      <TableHead className="text-right w-36">Qtd a Importar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractedItems.map((item) => {
                      const qty = importQuantities[item.code] ?? 0;
                      const exceedsBalance = qty > item.remaining;
                      return (
                        <TableRow key={item.code} className="text-xs">
                          <TableCell className="font-medium">
                            <div>{item.code}</div>
                            <div className="text-[11px] text-muted-foreground">{item.label}</div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {item.contracted}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {item.alreadyImported}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.remaining <= 0 ? (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completo
                              </Badge>
                            ) : (
                              <span className="font-bold text-amber-700">{item.remaining}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                setImportQuantities((prev) => ({
                                  ...prev,
                                  [item.code]: val,
                                }));
                              }}
                              className={`h-8 text-right font-semibold ${
                                exceedsBalance ? "border-amber-500 text-amber-700" : ""
                              }`}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {contractedItems.some((i) => (importQuantities[i.code] || 0) > i.remaining) && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Atenção: uma ou mais quantidades informadas excedem o saldo restante contratado
                    no pedido. Você ainda pode confirmar caso seja uma coleta extra.
                  </span>
                </div>
              )}

              {/* Destino Laboratorial */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs">Laboratório de Destino</Label>
                  <Select value={laboratory} onValueChange={setLaboratory}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {laboratories.map((lab) => (
                        <SelectItem key={lab.id} value={lab.name}>
                          {lab.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Data de Envio</Label>
                  <Input
                    type="date"
                    value={sendDate}
                    onChange={(e) => setSendDate(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Status da Remessa</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Enviado">Enviado</SelectItem>
                      <SelectItem value="Recebido">Recebido</SelectItem>
                      <SelectItem value="Executando">Executando</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={!selectedOrder || totalToImportNow <= 0 || submitting}
            onClick={handleConfirmImport}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Importar {totalToImportNow > 0 ? `${totalToImportNow} Amostras` : "Análises"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

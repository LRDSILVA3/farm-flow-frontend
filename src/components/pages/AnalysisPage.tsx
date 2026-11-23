import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Search, Plus, Trash2, Layers, CheckCircle2, Download, Tag, X, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { getLocalDateISO } from "@/lib/utils";
import { ImportOrderAnalysesDialog } from "./analyses/ImportOrderAnalysesDialog";
import { SampleLabelsDialog } from "./analyses/SampleLabelsDialog";

interface AnalysisExecution {
  id: string;
  orderId?: string;
  executionId?: string;
  isPartialImport?: boolean;
  analysisName: string;
  collaborator: string;
  clientId: string;
  clientName: string;
  farmId: string;
  farmName: string;
  plotId: string;
  plotName: string;
  quantity: number;
  status: "Pendente" | "Enviado" | "Recebido" | "Executando" | "Finalizado";
  sendDate: string;
  receiptDate: string;
  completionDate: string;
  rawResults?: Record<string, any>;
}

const STANDARD_ANALYSIS_TYPES = [
  { code: "MACRO+S+P_REM", label: "MACRO+S+P_REM (Completa)", defaultQty: 0 },
  { code: "MACRO+S", label: "MACRO+S (Profundidade 20-40 cm)", defaultQty: 0 },
  { code: "MACRO", label: "MACRO (Análise Simples)", defaultQty: 0 },
  { code: "ANÁLISE BIOAS", label: "ANÁLISE BIOAS (Biológica do Solo)", defaultQty: 0 },
  { code: "ANALISE DE FOLIAR", label: "ANALISE DE FOLIAR (Nutrição Foliar)", defaultQty: 0 },
  { code: "ANÁLISE FÍSICA", label: "ANÁLISE FÍSICA (Granulometria / Textura)", defaultQty: 0 },
  { code: "ANÁLISE 20-40 CM", label: "ANÁLISE 20-40 CM (Subsuperficial)", defaultQty: 0 },
];

const AnalisesPrincipalPage = () => {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<{id: string; name: string}[]>([]);
  const [farms, setFarms] = useState<{id: string; name: string; client_id?: string}[]>([]);

  const collaboratorsConfig = [
    { id: "1", name: "Laboratório Solo Forte" },
    { id: "2", name: "Laboratório AgroAnálises" },
    { id: "3", name: "IBRA Análises de Solo" },
    { id: "4", name: "Laboratório Coodetec" }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorFilter, setCollaboratorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<AnalysisExecution["status"]>("Recebido");
  const [bulkDate, setBulkDate] = useState<string>(getLocalDateISO());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [analysesPerPage, setAnalysesPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<AnalysisExecution | null>(null);

  // Estado para lote de análises
  const [batchClientId, setBatchClientId] = useState("");
  const [batchFarmId, setBatchFarmId] = useState("");
  const [batchCollaborator, setBatchCollaborator] = useState("Laboratório Solo Forte");
  const [batchSendDate, setBatchSendDate] = useState(getLocalDateISO());
  const [batchStatus, setBatchStatus] = useState<any>("Enviado");
  const [batchQuantities, setBatchQuantities] = useState<Record<string, number>>({
    "MACRO": 0,
    "MACRO+S": 0,
    "MACRO+S+P_REM": 0,
    "ANÁLISE BIOAS": 0,
    "ANALISE DE FOLIAR": 0,
    "ANÁLISE FÍSICA": 0,
    "ANÁLISE 20-40 CM": 0,
  });
  const [customType, setCustomType] = useState("");
  const [customTypeQty, setCustomTypeQty] = useState(0);

  // Estado para edição individual
  const [editFormData, setEditFormData] = useState<AnalysisExecution>({
    id: "",
    analysisName: "",
    collaborator: "",
    clientId: "",
    clientName: "",
    farmId: "",
    farmName: "",
    plotId: "",
    plotName: "",
    quantity: 1,
    status: "Pendente",
    sendDate: "",
    receiptDate: "",
    completionDate: ""
  });

  useEffect(() => {
    fetchData();

    const handleAnalysesUpdate = () => {
      fetchData();
    };
    window.addEventListener("farmflow-analyses-updated", handleAnalysesUpdate);
    return () => {
      window.removeEventListener("farmflow-analyses-updated", handleAnalysesUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analysesRes, clientsRes, farmsRes] = await Promise.all([
        api.get<any[]>('/analyses').catch(() => []),
        api.get<any[]>('/clients').catch(() => []),
        api.get<any[]>('/farms').catch(() => [])
      ]);

      const mapped: AnalysisExecution[] = (Array.isArray(analysesRes) ? analysesRes : []).map(a => ({
        id: a.id,
        orderId: a.order_id || undefined,
        executionId: (a.results && a.results.executionId) || undefined,
        isPartialImport: Boolean(a.results && a.results.isPartialImport),
        analysisName: a.type || a.analysis_name || "MACRO+S",
        collaborator: (a.results && a.results.collaborator) || a.collaborator || "Laboratório Solo Forte",
        clientId: a.client_id || "",
        clientName: (a.results && a.results.clientName) || a.client_name || "Cliente Padrão",
        farmId: a.farm_id || "",
        farmName: (a.results && a.results.farmName) || a.farm_name || "Fazenda",
        plotId: a.plot_id || "",
        plotName: (a.results && a.results.plotName) || a.plot_name || "Geral",
        quantity: (a.results && a.results.quantity) || a.quantity || 1,
        status: a.status || "Pendente",
        sendDate: a.date || a.send_date || "",
        receiptDate: (a.results && a.results.receiptDate) || a.receipt_date || "",
        completionDate: (a.results && a.results.completionDate) || a.completion_date || "",
        rawResults: a.results && typeof a.results === "object" ? a.results : {},
      }));

      setAnalyses(mapped);
      setClients(Array.isArray(clientsRes) ? clientsRes : []);
      setFarms(Array.isArray(farmsRes) ? farmsRes : []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar análises",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = 
      (analysis.collaborator || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (analysis.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (analysis.farmName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (analysis.analysisName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollab = !collaboratorFilter || analysis.collaborator === collaboratorFilter;
    const matchesStatus = !statusFilter || analysis.status === statusFilter;
    return matchesSearch && matchesCollab && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAnalyses.length / analysesPerPage));
  const currentAnalyses = filteredAnalyses.slice(
    (analysesPage - 1) * analysesPerPage,
    analysesPage * analysesPerPage
  );

  const farmsForSelectedClient = batchClientId
    ? farms.filter(f => !f.client_id || f.client_id === batchClientId)
    : farms;

  const handleOpenBatchModal = () => {
    if (clients.length > 0 && !batchClientId) {
      setBatchClientId(clients[0].id);
      const clientFarms = farms.filter(f => !f.client_id || f.client_id === clients[0].id);
      if (clientFarms.length > 0) {
        setBatchFarmId(clientFarms[0].id);
      }
    }
    setBatchQuantities({
      "MACRO": 0,
      "MACRO+S": 0,
      "MACRO+S+P_REM": 0,
      "ANALISE DE FOLIAR": 0,
      "ANÁLISE FÍSICA": 0,
      "ANÁLISE 20-40 CM": 0,
    });
    setCustomType("");
    setCustomTypeQty(0);
    setShowCreateModal(true);
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToCreate: { type: string; quantity: number }[] = [];

    Object.entries(batchQuantities).forEach(([type, qty]) => {
      if (qty > 0) {
        itemsToCreate.push({ type, quantity: qty });
      }
    });

    if (customType.trim() && customTypeQty > 0) {
      itemsToCreate.push({ type: customType.trim(), quantity: customTypeQty });
    }

    if (itemsToCreate.length === 0) {
      toast({
        title: "Nenhuma quantidade informada",
        description: "Preencha a quantidade em pelo menos um tipo de análise para salvar.",
        variant: "destructive"
      });
      return;
    }

    const selectedClient = clients.find(c => c.id === batchClientId);
    const selectedFarm = farms.find(f => f.id === batchFarmId);

    try {
      setLoading(true);
      await Promise.all(
        itemsToCreate.map(item =>
          api.post('/analyses', {
            type: item.type,
            farm_id: batchFarmId || null,
            status: batchStatus,
            date: batchSendDate,
            results: {
              collaborator: batchCollaborator,
              quantity: item.quantity,
              clientName: selectedClient?.name || "Produtor Rural",
              farmName: selectedFarm?.name || "Fazenda",
            }
          })
        )
      );

      toast({
        title: "Análises criadas com sucesso!",
        description: `Foram registradas ${itemsToCreate.length} tipos de análises para a fazenda.`
      });

      setShowCreateModal(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao criar análises em lote",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnalysis) return;

    try {
      await api.put(`/analyses/${editingAnalysis.id}`, {
        type: editFormData.analysisName,
        farm_id: editFormData.farmId || null,
        plot_id: editFormData.plotId || null,
        status: editFormData.status,
        date: editFormData.sendDate,
        results: {
          collaborator: editFormData.collaborator,
          quantity: editFormData.quantity,
          clientName: editFormData.clientName,
          farmName: editFormData.farmName,
          receiptDate: editFormData.receiptDate,
          completionDate: editFormData.completionDate
        }
      });

      toast({ title: "Análise atualizada", description: "Análise atualizada com sucesso." });
      setShowEditModal(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar análise", description: error.message, variant: "destructive" });
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allCurrentSelected =
    currentAnalyses.length > 0 && currentAnalyses.every((a) => selectedIds.includes(a.id));

  const toggleSelectAllCurrent = () => {
    if (allCurrentSelected) {
      const currentSet = new Set(currentAnalyses.map((a) => a.id));
      setSelectedIds((prev) => prev.filter((id) => !currentSet.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentAnalyses.map((a) => a.id)])));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.length === 0) return;
    const targets = analyses.filter((a) => selectedIds.includes(a.id));
    if (targets.length === 0) return;

    try {
      setIsBulkUpdating(true);
      await Promise.all(
        targets.map((item) => {
          const nextSendDate =
            bulkStatus === "Enviado" && bulkDate ? bulkDate : item.sendDate;
          const nextReceiptDate =
            bulkStatus === "Recebido" && bulkDate ? bulkDate : item.receiptDate;
          const nextCompletionDate =
            bulkStatus === "Finalizado" && bulkDate ? bulkDate : item.completionDate;

          return api.put(`/analyses/${item.id}`, {
            type: item.analysisName,
            farm_id: item.farmId || null,
            plot_id: item.plotId || null,
            status: bulkStatus,
            date: nextSendDate || null,
            results: {
              ...(item.rawResults || {}),
              collaborator: item.collaborator,
              quantity: item.quantity,
              clientName: item.clientName,
              farmName: item.farmName,
              plotName: item.plotName,
              receiptDate: nextReceiptDate,
              completionDate: nextCompletionDate,
            },
          });
        })
      );

      toast({
        title: "Status atualizado em lote!",
        description: `${targets.length} análise(s) atualizada(s) para "${bulkStatus}".`,
      });
      setSelectedIds([]);
      await fetchData();
      window.dispatchEvent(new CustomEvent("farmflow-analyses-updated"));
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status em lote",
        description: error.message || "Falha ao salvar alterações.",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/analyses/${id}`);
      toast({ title: "Análise excluída", description: "Análise removida com sucesso." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro ao excluir análise", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Finalizado":
        return <Badge className="bg-green-100 text-green-800 border-none">Finalizado</Badge>;
      case "Executando":
        return <Badge className="bg-blue-100 text-blue-800 border-none">Executando</Badge>;
      case "Recebido":
        return <Badge className="bg-purple-100 text-purple-800 border-none">Recebido</Badge>;
      case "Enviado":
        return <Badge className="bg-yellow-100 text-yellow-800 border-none">Enviado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Análises de Solo & Foliar</h2>
          <p className="text-muted-foreground text-sm">
            Lançamento em lote por fazenda, controle de remessas e laudos laboratoriais.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-indigo-600 text-indigo-700 hover:bg-indigo-50 shadow-sm gap-2"
            onClick={() => setShowLabelsModal(true)}
          >
            <Tag className="h-4 w-4" />
            Emitir Etiquetas (TrackMaker CSV)
          </Button>
          <Button
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 shadow-sm gap-2"
            onClick={() => setShowImportModal(true)}
          >
            <Download className="h-4 w-4" />
            Importar de Pedido (Parcial / Total)
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 shadow-sm gap-2"
            onClick={handleOpenBatchModal}
          >
            <Layers className="h-4 w-4" />
            Lançar Análises por Fazenda
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, fazenda, análise ou laboratório..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setAnalysesPage(1); }}
                className="pl-9"
              />
            </div>
            <div>
              <Select value={collaboratorFilter || "all"} onValueChange={(val) => { setCollaboratorFilter(val === "all" ? "" : val); setAnalysesPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Laboratório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Laboratórios</SelectItem>
                  {collaboratorsConfig.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter || "all"} onValueChange={(val) => { setStatusFilter(val === "all" ? "" : val); setAnalysesPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Recebido">Recebido</SelectItem>
                  <SelectItem value="Executando">Executando</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barra de Edição de Status em Lote */}
          {selectedIds.length > 0 && (
            <div className="mb-4 p-3 rounded-lg border border-indigo-200 bg-indigo-50/70 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-indigo-600 text-white text-xs font-semibold">
                  {selectedIds.length} {selectedIds.length === 1 ? "análise selecionada" : "análises selecionadas"}
                </Badge>
                <span className="text-xs text-indigo-900 font-medium">
                  ({analyses.filter((a) => selectedIds.includes(a.id)).reduce((acc, a) => acc + (Number(a.quantity) || 0), 0)} pts no total)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <Select
                  value={bulkStatus}
                  onValueChange={(val) => setBulkStatus(val as AnalysisExecution["status"])}
                >
                  <SelectTrigger className="h-8 w-full sm:w-40 text-xs bg-white">
                    <SelectValue placeholder="Novo Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Recebido">Recebido</SelectItem>
                    <SelectItem value="Executando">Executando</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>

                {(bulkStatus === "Enviado" || bulkStatus === "Recebido" || bulkStatus === "Finalizado") && (
                  <Input
                    type="date"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                    className="h-8 w-full sm:w-36 text-xs bg-white"
                    title={
                      bulkStatus === "Enviado"
                        ? "Data de Envio"
                        : bulkStatus === "Recebido"
                        ? "Data de Recebimento"
                        : "Data de Conclusão"
                    }
                  />
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={handleBulkStatusUpdate}
                  disabled={isBulkUpdating}
                  className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                >
                  {isBulkUpdating ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{isBulkUpdating ? "Atualizando..." : "Aplicar Status em Lote"}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900"
                  title="Limpar seleção"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando análises...</div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma análise encontrada.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allCurrentSelected}
                        onChange={toggleSelectAllCurrent}
                        aria-label="Selecionar todas as análises da página"
                        className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-indigo-600"
                      />
                    </TableHead>
                    <TableHead>Tipo de Análise</TableHead>
                    <TableHead>Cliente / Fazenda</TableHead>
                    <TableHead>Laboratório</TableHead>
                    <TableHead>Qtd Amostras</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Envio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAnalyses.map((a) => {
                    const isSelected = selectedIds.includes(a.id);
                    return (
                    <TableRow key={a.id} className={isSelected ? "bg-indigo-50/40" : undefined}>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectId(a.id)}
                          aria-label={`Selecionar análise ${a.analysisName}`}
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-indigo-600"
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-950">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-medium">
                          {a.analysisName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium flex items-center gap-1.5">
                          <span>{a.clientName}</span>
                          {a.isPartialImport && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-50 text-amber-800 border-amber-300">
                              Parcial
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {a.farmName}
                          {a.plotName && a.plotName !== "Geral" ? ` • ${a.plotName}` : ""}
                        </div>
                      </TableCell>
                      <TableCell>{a.collaborator}</TableCell>
                      <TableCell>
                        <span className="font-bold text-sm bg-muted/60 px-2 py-0.5 rounded">
                          {a.quantity} pts
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(a.status)}</TableCell>
                      <TableCell>{a.sendDate ? new Date(a.sendDate).toLocaleDateString('pt-BR') : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAnalysis(a);
                              setEditFormData(a);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(a.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {analysesPage} de {totalPages} ({filteredAnalyses.length} registros)
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setAnalysesPage(p => Math.max(1, p - 1))}
                      className={analysesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setAnalysesPage(p => Math.min(totalPages, p + 1))}
                      className={analysesPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL 1: LANÇAMENTO EM LOTE POR FAZENDA COM TODOS OS TIPOS PADRÃO */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-emerald-950">
              <Layers className="h-5 w-5 text-emerald-600" />
              Lançamento em Lote de Análises por Fazenda
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulário para envio em lote de amostras para análise laboratorial
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBatchCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/20 border rounded-lg">
              <div>
                <Label className="text-xs font-semibold">Cliente / Produtor</Label>
                <Select 
                  value={batchClientId} 
                  onValueChange={(val) => {
                    setBatchClientId(val);
                    const clientFarms = farms.filter(f => !f.client_id || f.client_id === val);
                    if (clientFarms.length > 0) {
                      setBatchFarmId(clientFarms[0].id);
                    } else {
                      setBatchFarmId("");
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Fazenda</Label>
                <Select 
                  value={batchFarmId} 
                  onValueChange={setBatchFarmId}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione a fazenda" /></SelectTrigger>
                  <SelectContent>
                    {farmsForSelectedClient.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Laboratório Destino</Label>
                <Select 
                  value={batchCollaborator} 
                  onValueChange={setBatchCollaborator}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {collaboratorsConfig.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Data de Envio</Label>
                <Input
                  type="date"
                  value={batchSendDate}
                  onChange={(e) => setBatchSendDate(e.target.value)}
                />
              </div>
            </div>

            {/* TABELA DE QUANTIDADES DIRETAS POR TIPO PADRÃO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-sm text-foreground">
                  Quantidades de Amostras por Tipo Oficial:
                </Label>
                <span className="text-xs text-muted-foreground">
                  (Preencha a quantidade desejada em cada tipo)
                </span>
              </div>

              <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                {STANDARD_ANALYSIS_TYPES.map((typeObj) => (
                  <div key={typeObj.code} className="flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors">
                    <div className="pr-2">
                      <span className="font-semibold text-xs block text-emerald-900">{typeObj.code}</span>
                      <span className="text-[11px] text-muted-foreground">{typeObj.label}</span>
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={batchQuantities[typeObj.code] === 0 ? "" : batchQuantities[typeObj.code]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setBatchQuantities(prev => ({ ...prev, [typeObj.code]: Math.max(0, val) }));
                        }}
                        className="text-right font-bold h-8"
                      />
                    </div>
                  </div>
                ))}

                {/* TIPO ADICIONAL / CUSTOMIZADO */}
                <div className="p-2.5 bg-muted/10 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Outro Tipo Personalizado:</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome do Tipo de Análise (Ex: Nematóide, Textura de Solo...)"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Qtd"
                      value={customTypeQty === 0 ? "" : customTypeQty}
                      onChange={(e) => setCustomTypeQty(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-8 w-24 text-right font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Total de amostras: <strong>
                  {Object.values(batchQuantities).reduce((acc, q) => acc + q, 0) + (customTypeQty || 0)}
                </strong>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-1.5 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Salvar Todas as Análises
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: EDIÇÃO INDIVIDUAL COM SELECT DOS TIPOS OFICIAIS */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Análise</DialogTitle>
            <DialogDescription className="sr-only">
              Editar detalhes da remessa ou resultado da análise laboratorial
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>Tipo de Análise</Label>
              <Select 
                value={editFormData.analysisName} 
                onValueChange={(val) => setEditFormData(prev => ({ ...prev, analysisName: val }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STANDARD_ANALYSIS_TYPES.map(t => (
                    <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>
                  ))}
                  <SelectItem value="Outro">Outro Tipo Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {editFormData.analysisName === "Outro" && (
                <Input
                  className="mt-2"
                  placeholder="Especifique o tipo de análise"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, analysisName: e.target.value }))}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Laboratório</Label>
                <Select 
                  value={editFormData.collaborator} 
                  onValueChange={(val) => setEditFormData(prev => ({ ...prev, collaborator: val }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {collaboratorsConfig.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantidade Amostras</Label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Envio</Label>
                <Input
                  type="date"
                  value={editFormData.sendDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, sendDate: e.target.value }))}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={editFormData.status} 
                  onValueChange={(val: any) => setEditFormData(prev => ({ ...prev, status: val }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ImportOrderAnalysesDialog
        open={showImportModal}
        onOpenChange={setShowImportModal}
        existingAnalyses={analyses}
        laboratories={collaboratorsConfig}
        onImported={fetchData}
      />
      <SampleLabelsDialog
        open={showLabelsModal}
        onOpenChange={setShowLabelsModal}
      />
    </div>
  );
};

export default AnalisesPrincipalPage;
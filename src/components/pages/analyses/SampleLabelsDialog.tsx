import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Tag,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  Save,
  History,
  Sparkles,
  Trash2,
  Filter,
  Check,
  Calendar,
  FlaskConical,
  Send
} from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { getLocalDateISO } from "@/lib/utils";
import { getStoredPdfHeaderConfig } from "../settings/PdfHeaderTab";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface TrackMakerSample {
  id: string;
  originalName: string;
  sampleNumber: string; // Número extraído após o _ (ex: "01")
  iconCode: string; // Código do ícone do Trackmaker (ex: "48", "42", "6")
  analysisType: string; // "Macro", "Macro+S", "Macro+S+P_rem"
  depth: string; // "0-20 cm", "20-40 cm", etc.
  status: "Coletado" | "Pendente";
  selected: boolean;
  easting?: string;
  northing?: string;
  customName?: string;
}

interface SampleLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFarmId?: string;
  initialPlotId?: string;
  initialPlotName?: string;
  initialClientName?: string;
  orderId?: string;
}

const DEFAULT_LABORATORIES = [
  { id: "1", name: "Laboratório Solo Forte" },
  { id: "2", name: "Laboratório AgroAnálises" },
  { id: "3", name: "IBRA Análises de Solo" },
  { id: "4", name: "Laboratório Coodetec" },
];

export const SampleLabelsDialog: React.FC<SampleLabelsDialogProps> = ({
  open,
  onOpenChange,
  initialFarmId,
  initialPlotId,
  initialPlotName,
  initialClientName,
  orderId,
}) => {
  const { toast } = useToast();
  const printContentRef = useRef<HTMLDivElement>(null);

  // Dados Cadastrais
  const [clients, setClients] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedFarmId, setSelectedFarmId] = useState<string>(initialFarmId || "");
  const [selectedPlotId, setSelectedPlotId] = useState<string>(initialPlotId || "");

  // Campos da Etiqueta
  const [labelCustomerName, setLabelCustomerName] = useState<string>("");
  const [labelSender, setLabelSender] = useState<string>("PRECIZA AGRICULTURA DE PRECISÃO");
  const [defaultDepth, setDefaultDepth] = useState<string>("0-20 cm");
  const [activeTab, setActiveTab] = useState<string>("import");

  // Amostras do TrackMaker
  const [samples, setSamples] = useState<TrackMakerSample[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [totalFileName, setTotalFileName] = useState<string>("");
  const [collectedFileName, setCollectedFileName] = useState<string>("");
  const [filterMode, setFilterMode] = useState<"all" | "selected" | "pending" | "collected">("all");

  // Lotes Salvos & Histórico
  const [savedBatches, setSavedBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState<boolean>(false);
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<any | null>(null);
  const [batchIdToDelete, setBatchIdToDelete] = useState<string | null>(null);

  // Estado para Despacho ao Laboratório a partir das Etiquetas
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [dispatchLaboratory, setDispatchLaboratory] = useState<string>("Laboratório Solo Forte");
  const [dispatchDate, setDispatchDate] = useState<string>(getLocalDateISO());
  const [dispatchStatus, setDispatchStatus] = useState<string>("Enviado");
  const [dispatchNotes, setDispatchNotes] = useState<string>("");
  const [selectedDispatchOrderId, setSelectedDispatchOrderId] = useState<string>(orderId || "");
  const [farmOrders, setFarmOrders] = useState<any[]>([]);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Carrega Clientes e Fazendas
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [clientsRes, farmsRes] = await Promise.all([
          api.get<any[]>("/clients").catch(() => []),
          api.get<any[]>("/farms").catch(() => []),
        ]);
        if (isMounted) {
          if (Array.isArray(clientsRes)) setClients(clientsRes);
          if (Array.isArray(farmsRes)) setFarms(farmsRes);
        }
      } catch (err) {
        console.error("Erro ao carregar clientes/fazendas", err);
      }
    };
    if (open) {
      loadData();
      const pdfConf = getStoredPdfHeaderConfig();
      if (pdfConf?.companyName) {
        setLabelSender(pdfConf.companyName);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [open]);

  // Carrega histórico de lotes emitidos
  const loadSavedBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      const url = selectedFarmId
        ? `/sample-label-batches?farm_id=${selectedFarmId}`
        : `/sample-label-batches`;
      const res = await api.get<any[]>(url);
      if (Array.isArray(res)) {
        setSavedBatches(res);
      }
    } catch (err) {
      console.error("Erro ao carregar lotes de etiquetas salvos", err);
    } finally {
      setLoadingBatches(false);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    if (open) {
      loadSavedBatches();
    }
  }, [open, loadSavedBatches]);

  // Carrega pedidos vinculados à fazenda selecionada para permitir despacho direto
  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const res = await api.get<any[]>("/orders");
        if (isMounted && Array.isArray(res)) {
          const filtered = res.filter(
            (o) => !selectedFarmId || o.farmId === selectedFarmId || o.farm_id === selectedFarmId
          );
          setFarmOrders(filtered);
          if (!orderId && filtered.length > 0 && !selectedDispatchOrderId) {
            setSelectedDispatchOrderId(filtered[0].id);
          }
        }
      } catch {}
    };
    if (open) {
      fetchOrders();
    }
    return () => {
      isMounted = false;
    };
  }, [open, selectedFarmId, orderId]);

  // Atualiza fazenda/talhão inicial se fornecido por props
  useEffect(() => {
    if (initialFarmId) setSelectedFarmId(initialFarmId);
    if (initialPlotId) setSelectedPlotId(initialPlotId);
    if (orderId) setSelectedDispatchOrderId(orderId);
  }, [initialFarmId, initialPlotId, orderId]);

  // Fazenda selecionada
  const selectedFarm = useMemo(() => {
    return farms.find((f) => f.id === selectedFarmId) || null;
  }, [farms, selectedFarmId]);

  // Talhões da fazenda selecionada
  const farmPlots = useMemo(() => {
    if (!selectedFarm || !Array.isArray(selectedFarm.plots)) return [];
    return selectedFarm.plots;
  }, [selectedFarm]);

  // Talhão selecionado
  const selectedPlot = useMemo(() => {
    if (!farmPlots || farmPlots.length === 0) return null;
    return farmPlots.find((p) => p.id === selectedPlotId || p.name === selectedPlotId) || null;
  }, [farmPlots, selectedPlotId]);

  // Atualiza cliente e nome na etiqueta quando a fazenda ou talhão muda
  useEffect(() => {
    if (selectedFarm) {
      if (selectedFarm.client_id) {
        setSelectedClientId(selectedFarm.client_id);
      }
    }

    // Regra de Prioridade do Nome na Etiqueta:
    // 1º: Responsável do Talhão
    // 2º: Responsável da Fazenda
    // 3º: Nome do Cliente
    const plotResp = selectedPlot?.responsible_name?.trim();
    const farmResp = selectedFarm?.responsible_name?.trim();
    const clientFound = clients.find(
      (c) => c.id === (selectedFarm?.client_id || selectedClientId)
    );
    const clientName = clientFound?.name || selectedFarm?.clientName || initialClientName || "";

    const finalName = plotResp || farmResp || clientName || "";
    setLabelCustomerName(finalName);
  }, [selectedFarm, selectedPlot, clients, selectedClientId, initialClientName]);

  // Informações calculadas da área
  const areaInfo = useMemo(() => {
    const propName = selectedFarm?.name || "Propriedade";
    const plotName = selectedPlot?.name || initialPlotName || "Talhão";
    const propTalhao = `${propName} - ${plotName}`;
    const hectares = selectedPlot?.area ? parseFloat(selectedPlot.area).toFixed(2) : (selectedFarm?.area ? parseFloat(selectedFarm.area).toFixed(2) : "-");
    const lot = selectedPlot?.lot || selectedFarm?.lot || "-";
    const registration = selectedPlot?.registration || selectedFarm?.registration || "-";
    const city = selectedPlot?.city || selectedFarm?.city || "";
    const state = selectedPlot?.state || selectedFarm?.state || "";
    const cityState = city && state ? `${city}/${state}` : city || state || "-";

    return {
      propTalhao,
      hectares,
      lot,
      registration,
      cityState,
    };
  }, [selectedFarm, selectedPlot, initialPlotName]);

  // Parser do CSV do GPS TrackMaker
  const parseTrackMakerCSV = (content: string): Array<{ name: string; sampleNumber: string; icon: string }> => {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Detecta separador (; ou , ou \t)
    const firstLine = lines[0];
    let sep = ";";
    if (firstLine.includes(";")) sep = ";";
    else if (firstLine.includes("\t")) sep = "\t";
    else if (firstLine.includes(",")) sep = ",";

    // Encontra índice do cabeçalho
    const headerParts = firstLine.split(sep).map((h) => h.trim().replace(/^["']|["']$/g, ""));
    let nameIdx = headerParts.findIndex((h) => /^nome$/i.test(h) || /^name$/i.test(h));
    let iconIdx = headerParts.findIndex((h) => /^[íi]cone$/i.test(h) || /^icon$/i.test(h) || /^sym$/i.test(h));

    // Se a primeira linha não tinha o cabeçalho 'Nome', procura nas primeiras 5 linhas
    let dataStartLine = 1;
    if (nameIdx === -1) {
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const parts = lines[i].split(sep).map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const nIdx = parts.findIndex((h) => /^nome$/i.test(h) || /^name$/i.test(h));
        if (nIdx !== -1) {
          nameIdx = nIdx;
          iconIdx = parts.findIndex((h) => /^[íi]cone$/i.test(h) || /^icon$/i.test(h) || /^sym$/i.test(h));
          dataStartLine = i + 1;
          break;
        }
      }
    }

    // Fallback padrão se não encontrou nomes de colunas: Coluna 1 = Nome, Coluna 8 ou 9 = Ícone
    if (nameIdx === -1) nameIdx = 1;
    if (iconIdx === -1) iconIdx = 8;

    const parsedResults: Array<{ name: string; sampleNumber: string; icon: string }> = [];

    for (let i = dataStartLine; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(sep).map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length <= nameIdx) continue;

      const rawName = cols[nameIdx] || "";
      if (!rawName || /^nome$/i.test(rawName)) continue;

      // Regra de extração: pegar sempre o número após o "_"
      // Ex: JB_01 -> "01", Talhao1_45 -> "45"
      let sampleNum = rawName;
      if (rawName.includes("_")) {
        const afterUnderscore = rawName.split("_").pop();
        if (afterUnderscore && afterUnderscore.trim()) {
          sampleNum = afterUnderscore.trim();
        }
      }

      const iconVal = iconIdx >= 0 && cols.length > iconIdx ? cols[iconIdx] : "";

      parsedResults.push({
        name: rawName,
        sampleNumber: sampleNum,
        icon: iconVal,
      });
    }

    return parsedResults;
  };

  // Mapeia código do Ícone do TrackMaker para o tipo de Análise
  const mapIconToAnalysisType = (iconCode: string): string => {
    const code = iconCode.trim();
    if (code === "48") return "Macro";
    if (code === "42") return "Macro+S";
    if (code === "6") return "Macro+S+P_rem";
    return "Macro";
  };

  // Upload do Arquivo de Pontos Totais (Planejamento / Grade completa)
  const handleUploadTotalPoints = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTotalFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const parsed = parseTrackMakerCSV(text);
      if (parsed.length === 0) {
        toast({
          title: "Formato não reconhecido",
          description: "Não foi possível extrair waypoints do arquivo CSV.",
          variant: "destructive",
        });
        return;
      }

      const newSamples: TrackMakerSample[] = parsed.map((p, idx) => {
        const analysis = mapIconToAnalysisType(p.icon);
        const depth = p.icon === "42" ? "20-40 cm" : defaultDepth;
        return {
          id: `total-${idx + 1}-${Date.now()}`,
          originalName: p.name,
          sampleNumber: p.sampleNumber,
          iconCode: p.icon,
          analysisType: analysis,
          depth: depth,
          status: "Pendente",
          selected: true,
        };
      });

      setSamples(newSamples);
      toast({
        title: "Pontos Totais Importados",
        description: `${newSamples.length} waypoints carregados com sucesso.`,
      });
    };
    reader.readAsText(file, "ISO-8859-1");
  };

  // Upload do Arquivo de Pontos Coletados (Campo / Waypoints realizados)
  const handleUploadCollectedPoints = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCollectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const parsedCollected = parseTrackMakerCSV(text);
      if (parsedCollected.length === 0) {
        toast({
          title: "Nenhum ponto encontrado",
          description: "Verifique o arquivo de pontos coletados.",
          variant: "destructive",
        });
        return;
      }

      const collectedSet = new Set(
        parsedCollected.map((p) => p.sampleNumber.toLowerCase())
      );

      // Se já tínhamos os pontos totais carregados, fazemos o cruzamento
      if (samples.length > 0) {
        let matchCount = 0;
        setSamples((prev) =>
          prev.map((s) => {
            const isCollected = collectedSet.has(s.sampleNumber.toLowerCase());
            if (isCollected) matchCount++;
            return {
              ...s,
              status: isCollected ? "Coletado" : "Pendente",
              selected: isCollected, // Por padrão, seleciona apenas os que foram coletados
            };
          })
        );

        toast({
          title: "Cruzamento Concluído",
          description: `${matchCount} amostras identificadas como coletadas.`,
        });
      } else {
        // Se carregou direto os coletados sem arquivo total prévio
        const directSamples: TrackMakerSample[] = parsedCollected.map((p, idx) => {
          const analysis = mapIconToAnalysisType(p.icon);
          const depth = p.icon === "42" ? "20-40 cm" : defaultDepth;
          return {
            id: `collected-${idx + 1}-${Date.now()}`,
            originalName: p.name,
            sampleNumber: p.sampleNumber,
            iconCode: p.icon,
            analysisType: analysis,
            depth: depth,
            status: "Coletado",
            selected: true,
          };
        });

        setSamples(directSamples);
        toast({
          title: "Pontos Coletados Importados",
          description: `${directSamples.length} amostras coletadas prontas para emissão.`,
        });
      }
    };
    reader.readAsText(file, "ISO-8859-1");
  };

  // Métricas do resumo
  const metrics = useMemo(() => {
    const total = samples.length;
    const collected = samples.filter((s) => s.status === "Coletado").length;
    const pending = total - collected;
    const selected = samples.filter((s) => s.selected).length;
    return { total, collected, pending, selected };
  }, [samples]);

  // Controles de Seleção
  const handleSelectAll = (select: boolean) => {
    setSamples((prev) => prev.map((s) => ({ ...s, selected: select })));
  };

  const handleSelectOnlyCollected = () => {
    setSamples((prev) =>
      prev.map((s) => ({ ...s, selected: s.status === "Coletado" }))
    );
    toast({
      title: "Somente Coletadas Selecionadas",
      description: "Marcadas apenas as amostras com status 'Coletado'.",
    });
  };

  const handleSelectOnlyPending = () => {
    setSamples((prev) =>
      prev.map((s) => ({ ...s, selected: s.status === "Pendente" }))
    );
    toast({
      title: "Somente Restantes / Pendentes Selecionadas",
      description: "Marcadas apenas as amostras pendentes que ainda não foram enviadas.",
    });
  };

  const handleToggleSample = (id: string) => {
    setSamples((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleUpdateDepthGlobal = (newDepth: string) => {
    setDefaultDepth(newDepth);
    setSamples((prev) =>
      prev.map((s) => (s.selected ? { ...s, depth: newDepth } : s))
    );
  };

  // Amostras filtradas para exibição na tabela
  const filteredSamples = useMemo(() => {
    if (filterMode === "selected") return samples.filter((s) => s.selected);
    if (filterMode === "pending") return samples.filter((s) => s.status === "Pendente" || !s.selected);
    if (filterMode === "collected") return samples.filter((s) => s.status === "Coletado");
    return samples;
  }, [samples, filterMode]);

  // Agrupamento das amostras selecionadas por Tipo de Análise (para despacho)
  const analysisSummary = useMemo(() => {
    const selectedSamples = samples.filter((s) => s.selected);
    const counts: Record<string, number> = {};
    const sampleNumbersByType: Record<string, string[]> = {};

    selectedSamples.forEach((s) => {
      const type = s.analysisType.toUpperCase();
      counts[type] = (counts[type] || 0) + 1;
      if (!sampleNumbersByType[type]) sampleNumbersByType[type] = [];
      sampleNumbersByType[type].push(s.sampleNumber);
    });

    return { counts, sampleNumbersByType, total: selectedSamples.length };
  }, [samples]);

  // Grava lote de emissão no banco de dados
  const handleSaveBatch = async (isManualClick = true) => {
    const selectedSamples = samples.filter((s) => s.selected);
    if (selectedSamples.length === 0) {
      if (isManualClick) {
        toast({
          title: "Nenhuma amostra selecionada",
          description: "Selecione as amostras para salvar o lote de emissão.",
          variant: "destructive",
        });
      }
      return;
    }

    const pendingSamples = samples.filter((s) => !s.selected);

    try {
      setIsSavingBatch(true);
      const payload = {
        farm_id: selectedFarmId || null,
        plot_id: selectedPlotId || null,
        order_id: selectedDispatchOrderId || orderId || null,
        client_name: labelCustomerName || "Cliente",
        farm_name: selectedFarm?.name || areaInfo.propTalhao,
        plot_name: selectedPlot?.name || initialPlotName || "Talhão",
        responsible_name: selectedPlot?.responsible_name || selectedFarm?.responsible_name || labelCustomerName,
        responsible_cpf: selectedPlot?.responsible_cpf || selectedFarm?.responsible_cpf || null,
        sender: labelSender,
        hectares: String(areaInfo.hectares),
        lot: String(areaInfo.lot),
        registration: String(areaInfo.registration),
        city_state: String(areaInfo.cityState),
        total_samples_count: samples.length,
        emitted_count: selectedSamples.length,
        pending_count: pendingSamples.length,
        samples: selectedSamples,
        pending_samples: pendingSamples,
        notes: `Emissão de ${selectedSamples.length} etiquetas (${pendingSamples.length} restantes/pendentes)`,
      };

      await api.post("/sample-label-batches", payload);
      if (isManualClick) {
        toast({
          title: "Lote Salvo com Sucesso!",
          description: `Emissão de ${selectedSamples.length} etiquetas gravada no histórico.`,
        });
      }
      loadSavedBatches();
    } catch (err: any) {
      console.error("Erro ao salvar lote de etiquetas", err);
      if (isManualClick) {
        toast({
          title: "Erro ao salvar lote",
          description: err.message || "Não foi possível gravar o lote no histórico.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Carrega amostras restantes não enviadas de um lote salvo para a tela atual
  const handleLoadPendingFromBatch = (batch: any) => {
    const remaining = Array.isArray(batch.pending_samples) ? batch.pending_samples : [];
    if (remaining.length === 0) {
      toast({
        title: "Sem amostras restantes",
        description: "Este lote já havia emitido 100% das amostras da área.",
        variant: "destructive",
      });
      return;
    }

    // Carrega dados da área
    if (batch.farm_id) setSelectedFarmId(batch.farm_id);
    if (batch.plot_id) setSelectedPlotId(batch.plot_id);
    if (batch.client_name) setLabelCustomerName(batch.client_name);
    if (batch.sender) setLabelSender(batch.sender);
    if (batch.order_id) setSelectedDispatchOrderId(batch.order_id);

    // Converte para TrackMakerSample com status 'Coletado' e selecionadas
    const loadedSamples: TrackMakerSample[] = remaining.map((s: any, idx: number) => ({
      id: s.id || `pending-${idx + 1}-${Date.now()}`,
      originalName: s.originalName || s.name || `Ponto_${s.sampleNumber}`,
      sampleNumber: s.sampleNumber,
      iconCode: s.iconCode || "48",
      analysisType: s.analysisType || "Macro",
      depth: s.depth || defaultDepth,
      status: "Coletado",
      selected: true,
      customName: s.customName || "",
    }));

    setSamples(loadedSamples);
    setActiveTab("import");

    toast({
      title: "Amostras Restantes Carregadas!",
      description: `${loadedSamples.length} amostras que não haviam sido enviadas no lote anterior foram carregadas prontas para emissão!`,
    });
  };

  // Baixa CSV diretamente de um lote salvo
  const handleReexportBatchCSV = (batch: any) => {
    const batchSamples: TrackMakerSample[] = Array.isArray(batch.samples) ? batch.samples : [];
    if (batchSamples.length === 0) {
      toast({
        title: "Lote vazio",
        description: "Este lote não possui amostras gravadas.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Nome",
      "Propriedade/Talhão",
      "Hectares",
      "Lote",
      "Matrícula",
      "Município/Estado",
      "Amostra",
      "Determinar",
      "Profundidade",
      "Remetente",
    ];

    const escapeCSV = (val: string | number | undefined | null) => {
      const str = String(val ?? "");
      if (str.includes(";") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const propTalhao = `${batch.farm_name || "Fazenda"} - ${batch.plot_name || "Talhão"}`;
    const rows = batchSamples.map((s) => {
      const clientName = s.customName || batch.client_name || labelCustomerName || "Cliente";
      return [
        escapeCSV(clientName),
        escapeCSV(propTalhao),
        escapeCSV(batch.hectares || areaInfo.hectares),
        escapeCSV(batch.lot || areaInfo.lot),
        escapeCSV(batch.registration || areaInfo.registration),
        escapeCSV(batch.city_state || areaInfo.cityState),
        escapeCSV(s.sampleNumber),
        escapeCSV(s.analysisType),
        escapeCSV(s.depth),
        escapeCSV(batch.sender || labelSender),
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanProp = propTalhao.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `etiquetas_${cleanProp}_lote.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV do Lote Exportado!",
      description: `${batchSamples.length} etiquetas exportadas com base no registro salvo.`,
    });
  };

  // Exclui lote do histórico (confirmado via AlertDialog)
  const confirmDeleteBatch = async () => {
    if (!batchIdToDelete) return;
    const batchId = batchIdToDelete;
    setBatchIdToDelete(null);
    try {
      await api.delete(`/sample-label-batches/${batchId}`);
      toast({
        title: "Lote excluído",
        description: "O lote foi removido do histórico.",
      });
      loadSavedBatches();
      if (selectedBatchDetails?.id === batchId) {
        setSelectedBatchDetails(null);
      }
    } catch (err: any) {
      toast({
        title: "Erro ao excluir lote",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Ação: Lançar Remessa de Análises Enviadas ao Laboratório a partir das Etiquetas
  const handleConfirmDispatchToLab = async () => {
    if (analysisSummary.total === 0) {
      toast({
        title: "Nenhuma amostra selecionada",
        description: "Selecione as amostras que deseja despachar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDispatching(true);

      const promises = Object.entries(analysisSummary.counts).map(([type, qty]) => {
        let standardType = type;
        if (type.includes("P_REM") || type.includes("PREM")) {
          standardType = "MACRO+S+P_REM";
        } else if (type.includes("+S")) {
          standardType = "MACRO+S";
        } else if (type.includes("MACRO")) {
          standardType = "MACRO";
        }

        return api.post("/analyses", {
          type: standardType,
          farm_id: selectedFarmId || null,
          plot_id: selectedPlotId || null,
          order_id: selectedDispatchOrderId || orderId || null,
          status: dispatchStatus || "Enviado",
          date: dispatchDate || getLocalDateISO(),
          results: {
            collaborator: dispatchLaboratory,
            quantity: qty,
            clientName: labelCustomerName || "Cliente",
            farmName: selectedFarm?.name || areaInfo.propTalhao,
            plotName: selectedPlot?.name || initialPlotName || "Talhão",
            sampleNumbers: analysisSummary.sampleNumbersByType[type] || [],
            origin: "etiquetas_trackmaker",
            dispatchNotes: dispatchNotes || `Remessa gerada a partir das etiquetas do TrackMaker (${qty} amostras)`,
          },
        });
      });

      await Promise.all(promises);

      // Salva o lote de etiquetas com anotação do envio
      await handleSaveBatch(false);

      toast({
        title: "Análises Despachadas com Sucesso!",
        description: `${analysisSummary.total} amostras registradas para o ${dispatchLaboratory}. O módulo de Análises e Pedidos foram atualizados!`,
      });

      setShowDispatchModal(false);
      window.dispatchEvent(new CustomEvent("farmflow-analyses-updated"));
    } catch (err: any) {
      console.error("Erro ao despachar análises", err);
      toast({
        title: "Erro ao despachar para o laboratório",
        description: err.message || "Não foi possível registrar o envio das análises.",
        variant: "destructive",
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Abre o modal de despacho a partir de um lote salvo
  const handleOpenDispatchForSavedBatch = (batch: any) => {
    if (batch.farm_id) setSelectedFarmId(batch.farm_id);
    if (batch.plot_id) setSelectedPlotId(batch.plot_id);
    if (batch.client_name) setLabelCustomerName(batch.client_name);
    if (batch.order_id) setSelectedDispatchOrderId(batch.order_id);

    const batchSamples: TrackMakerSample[] = Array.isArray(batch.samples)
      ? batch.samples.map((s: any) => ({ ...s, selected: true }))
      : [];
    if (batchSamples.length > 0) {
      setSamples(batchSamples);
    }
    setShowDispatchModal(true);
  };

  // 1. AÇÃO: EXPORTAR CSV POR TALHÃO
  const handleExportCSV = () => {
    const selectedSamples = samples.filter((s) => s.selected);
    if (selectedSamples.length === 0) {
      toast({
        title: "Nenhuma amostra selecionada",
        description: "Selecione ao menos uma amostra para emitir o CSV das etiquetas.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Nome",
      "Propriedade/Talhão",
      "Hectares",
      "Lote",
      "Matrícula",
      "Município/Estado",
      "Amostra",
      "Determinar",
      "Profundidade",
      "Remetente",
    ];

    const escapeCSV = (val: string | number | undefined | null) => {
      const str = String(val ?? "");
      if (str.includes(";") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = selectedSamples.map((s) => {
      const clientName = s.customName || labelCustomerName || "Cliente";
      return [
        escapeCSV(clientName),
        escapeCSV(areaInfo.propTalhao),
        escapeCSV(areaInfo.hectares),
        escapeCSV(areaInfo.lot),
        escapeCSV(areaInfo.registration),
        escapeCSV(areaInfo.cityState),
        escapeCSV(s.sampleNumber),
        escapeCSV(s.analysisType),
        escapeCSV(s.depth),
        escapeCSV(labelSender),
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanProp = areaInfo.propTalhao.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `etiquetas_${cleanProp}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Salva automaticamente o lote no histórico para rastreabilidade
    handleSaveBatch(false);

    toast({
      title: "CSV de Etiquetas Gerado!",
      description: `${selectedSamples.length} etiquetas exportadas e lote gravado no histórico.`,
    });
  };

  // 2. AÇÃO: IMPRIMIR ETIQUETAS (WINDOW.PRINT)
  const handlePrintLabels = () => {
    const selectedSamples = samples.filter((s) => s.selected);
    if (selectedSamples.length === 0) {
      toast({
        title: "Nenhuma amostra selecionada",
        description: "Selecione as amostras que deseja imprimir.",
        variant: "destructive",
      });
      return;
    }
    // Salva automaticamente o lote no histórico
    handleSaveBatch(false);
    window.print();
  };

  // 3. AÇÃO: BAIXAR PDF DAS ETIQUETAS VIA JSPDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById("printable-sample-labels-root");
    if (!element) {
      toast({
        title: "Elemento de impressão não encontrado",
        description: "Abra a aba de 'Visualizar Etiquetas' antes de baixar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const cleanProp = areaInfo.propTalhao.replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`etiquetas_${cleanProp}.pdf`);

      // Salva lote
      handleSaveBatch(false);

      toast({
        title: "PDF de Etiquetas Baixado!",
        description: "Arquivo PDF gerado e lote registrado no histórico com sucesso.",
      });
    } catch (err: any) {
      console.error("Erro ao gerar PDF", err);
      toast({
        title: "Erro ao gerar PDF",
        description: err.message || "Tente a opção de Impressão Direta do navegador.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const selectedSamplesList = useMemo(() => {
    return samples.filter((s) => s.selected);
  }, [samples]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[94vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Tag className="h-5 w-5 text-indigo-600" />
                Emissão de Etiquetas de Amostras (GPS TrackMaker)
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300 text-xs font-semibold">
                  CSV & PDF Otimizado A4
                </Badge>
                {savedBatches.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border border-slate-300">
                    <History className="h-3 w-3 mr-1" />
                    {savedBatches.length} {savedBatches.length === 1 ? "lote salvo" : "lotes salvos"}
                  </Badge>
                )}
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Importe o CSV do GPS TrackMaker, confira pontos coletados vs pendentes, salve o histórico e retome facilmente amostras não enviadas.
            </DialogDescription>
          </DialogHeader>

          {/* 1. SELEÇÃO DA ÁREA / PROPRIEDADE / TALHÃO */}
          <div className="p-3.5 rounded-lg border bg-muted/30 space-y-3 mt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Layers className="h-4 w-4 text-indigo-600" />
              Dados Cadastrais da Área (1 CSV por Talhão)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fazenda */}
              <div>
                <Label className="text-xs">Fazenda / Propriedade:</Label>
                <Select
                  value={selectedFarmId}
                  onValueChange={(val) => {
                    setSelectedFarmId(val);
                    setSelectedPlotId("");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs mt-1 bg-background">
                    <SelectValue placeholder="Selecione a Fazenda" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} {f.clientName ? `(${f.clientName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Talhão */}
              <div>
                <Label className="text-xs">Talhão do Envio:</Label>
                <Select
                  value={selectedPlotId}
                  onValueChange={(val) => setSelectedPlotId(val)}
                  disabled={!selectedFarmId || farmPlots.length === 0}
                >
                  <SelectTrigger className="h-9 text-xs mt-1 bg-background">
                    <SelectValue placeholder={farmPlots.length === 0 ? "Sem talhões cadastrados" : "Selecione o Talhão"} />
                  </SelectTrigger>
                  <SelectContent>
                    {farmPlots.map((p) => (
                      <SelectItem key={p.id || p.name} value={p.id || p.name}>
                        {p.name} ({p.area ? `${parseFloat(p.area).toFixed(1)} ha` : "Área N/A"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome na Etiqueta (Editável com Prioridade Automática) */}
              <div>
                <Label className="text-xs flex items-center justify-between">
                  <span>Nome na Etiqueta:</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Editável)</span>
                </Label>
                <Input
                  value={labelCustomerName}
                  onChange={(e) => setLabelCustomerName(e.target.value)}
                  placeholder="Nome do Responsável / Produtor"
                  className="h-9 text-xs mt-1 bg-background font-medium text-foreground"
                />
              </div>
            </div>

            {/* Dados Resumidos Puxados Automaticamente */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Propriedade/Talhão:</span>
                <span className="font-semibold text-foreground truncate block" title={areaInfo.propTalhao}>
                  {areaInfo.propTalhao}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Área (Hectares):</span>
                <span className="font-semibold text-foreground">{areaInfo.hectares} ha</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Lote:</span>
                <span className="font-semibold text-foreground">{areaInfo.lot}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Matrícula:</span>
                <span className="font-semibold text-foreground">{areaInfo.registration}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Município/UF:</span>
                <span className="font-semibold text-foreground">{areaInfo.cityState}</span>
              </div>
            </div>
          </div>

          {/* 2. TABS: IMPORTAÇÃO TRACKMAKER VS VISUALIZAÇÃO DE IMPRESSÃO VS LOTES SALVOS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="import" className="text-xs flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                <span>Importação & Conferência ({samples.length})</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>Visualizar Etiquetas ({metrics.selected})</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-indigo-600" />
                <span>Lotes Salvos & Histórico ({savedBatches.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* ABA 1: IMPORTAÇÃO E CONFERÊNCIA DOS PONTOS */}
            <TabsContent value="import" className="space-y-4 mt-3">
              {/* Dropzones de Importação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pontos Totais (Planejamento) */}
                <div className="p-3.5 border-2 border-dashed rounded-lg bg-indigo-50/20 hover:bg-indigo-50/40 border-indigo-200 transition-colors text-center">
                  <FileSpreadsheet className="h-6 w-6 text-indigo-600 mx-auto mb-1.5" />
                  <h5 className="font-semibold text-xs text-foreground">1. Pontos Totais (Grade Planejada)</h5>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    CSV extraído do TrackMaker com todos os pontos do talhão.
                  </p>
                  <div className="relative inline-block">
                    <Input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleUploadTotalPoints}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Button variant="outline" size="sm" className="h-7 text-xs pointer-events-none gap-1 bg-background">
                      <Upload className="h-3.5 w-3.5" />
                      {totalFileName ? totalFileName : "Carregar Pontos Totais"}
                    </Button>
                  </div>
                </div>

                {/* Pontos Coletados (Campo) */}
                <div className="p-3.5 border-2 border-dashed rounded-lg bg-emerald-50/20 hover:bg-emerald-50/40 border-emerald-300 transition-colors text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1.5" />
                  <h5 className="font-semibold text-xs text-foreground">2. Pontos Coletados (Campo / Waypoints)</h5>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    CSV com os pontos que o operador já coletou no campo.
                  </p>
                  <div className="relative inline-block">
                    <Input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleUploadCollectedPoints}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Button variant="outline" size="sm" className="h-7 text-xs pointer-events-none gap-1 bg-background text-emerald-700 border-emerald-300">
                      <Upload className="h-3.5 w-3.5" />
                      {collectedFileName ? collectedFileName : "Carregar Pontos Coletados"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Barra de Ações, Filtros e Seleção Rápida */}
              {samples.length > 0 && (
                <div className="p-3 rounded-lg border bg-card space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    {/* Filtros de Visualização por Status */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Filter className="h-3 w-3" /> Filtrar:
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={filterMode === "all" ? "default" : "outline"}
                        onClick={() => setFilterMode("all")}
                        className="h-6 px-2 text-[11px]"
                      >
                        Todas ({metrics.total})
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={filterMode === "selected" ? "default" : "outline"}
                        onClick={() => setFilterMode("selected")}
                        className="h-6 px-2 text-[11px] text-indigo-700 bg-indigo-50 border-indigo-200"
                      >
                        Selecionadas ({metrics.selected})
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={filterMode === "pending" ? "default" : "outline"}
                        onClick={() => setFilterMode("pending")}
                        className="h-6 px-2 text-[11px] text-amber-800 bg-amber-50 border-amber-200"
                      >
                        Pendentes / Restantes ({metrics.pending})
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={filterMode === "collected" ? "default" : "outline"}
                        onClick={() => setFilterMode("collected")}
                        className="h-6 px-2 text-[11px] text-emerald-800 bg-emerald-50 border-emerald-200"
                      >
                        Coletadas ({metrics.collected})
                      </Button>
                    </div>

                    {/* Ações Inteligentes de Marcação */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectOnlyPending}
                        className="h-6 text-[11px] px-2 text-amber-800 hover:bg-amber-100/60 border-amber-300 font-semibold gap-1"
                        title="Seleciona apenas as amostras que ainda faltam coletar ou emitir"
                      >
                        <Sparkles className="h-3 w-3 text-amber-600" />
                        Pegar Não Enviadas ({metrics.pending})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectOnlyCollected}
                        className="h-6 text-[11px] px-2 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                      >
                        Apenas Coletadas
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll(true)}
                        className="h-6 text-[11px] px-2"
                      >
                        Marcar Todas
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectAll(false)}
                        className="h-6 text-[11px] px-2 text-muted-foreground"
                      >
                        Desmarcar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Ajustes Globais da Etiqueta */}
              {samples.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20 text-xs">
                  <div>
                    <Label className="text-xs">Remetente (Consultoria / Empresa):</Label>
                    <Input
                      value={labelSender}
                      onChange={(e) => setLabelSender(e.target.value)}
                      placeholder="Nome do Remetente"
                      className="h-8 text-xs mt-1 bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Profundidade das Amostras Selecionadas:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Select value={defaultDepth} onValueChange={handleUpdateDepthGlobal}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-20 cm">0-20 cm (Superficial)</SelectItem>
                          <SelectItem value="20-40 cm">20-40 cm (Subsuperficial)</SelectItem>
                          <SelectItem value="0-40 cm">0-40 cm (Perfil)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Conferência dos Pontos */}
              {samples.length > 0 ? (
                <div className="border rounded-md overflow-x-auto max-h-[360px] overflow-y-auto w-full">
                  <Table className="w-full min-w-[650px] text-xs">
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-10 text-center">
                          <input
                            type="checkbox"
                            checked={metrics.selected > 0 && metrics.selected === metrics.total}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead className="w-20">Amostra</TableHead>
                        <TableHead>Determinar</TableHead>
                        <TableHead className="w-24">Profundidade</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead>Propriedade / Talhão</TableHead>
                        <TableHead>Lote / Matrícula</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSamples.map((s) => (
                        <TableRow
                          key={s.id}
                          className={s.selected ? "bg-indigo-50/30" : "hover:bg-muted/30"}
                        >
                          <TableCell className="text-center py-2">
                            <input
                              type="checkbox"
                              checked={s.selected}
                              onChange={() => handleToggleSample(s.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-bold py-2 text-foreground">
                            {s.sampleNumber}
                            <span className="block text-[10px] text-muted-foreground font-normal">
                              ({s.originalName})
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              variant="outline"
                              className={
                                s.analysisType.includes("P_rem")
                                  ? "bg-purple-50 text-purple-800 border-purple-200 text-[11px] font-semibold"
                                  : s.analysisType.includes("+S")
                                  ? "bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-semibold"
                                  : "bg-blue-50 text-blue-800 border-blue-200 text-[11px] font-semibold"
                              }
                            >
                              {s.analysisType}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-[11px] font-medium text-foreground">
                            {s.depth}
                          </TableCell>
                          <TableCell className="py-2">
                            {s.status === "Coletado" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Coletado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Clock className="h-3 w-3" />
                                Pendente
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-[11px] text-foreground">
                            {areaInfo.propTalhao}
                          </TableCell>
                          <TableCell className="py-2 text-[11px] text-muted-foreground">
                            L: {areaInfo.lot} • M: {areaInfo.registration}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-lg bg-muted/10 text-muted-foreground text-xs space-y-2">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <p className="font-medium text-sm text-foreground">Nenhum ponto do TrackMaker carregado ainda.</p>
                  <p className="max-w-md mx-auto text-[11px]">
                    Clique em <strong>"Carregar Pontos Totais"</strong> para importar a grade de waypoints gerada no GPS TrackMaker, ou consulte a aba <strong>"Lotes Salvos"</strong> para carregar amostras pendentes.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* ABA 2: VISUALIZAÇÃO DE IMPRESSÃO (GRID OTIMIZADO A4) */}
            <TabsContent value="preview" className="space-y-4 mt-3">
              <div className="flex items-center justify-between gap-2 p-3 bg-muted/40 rounded-lg text-xs flex-wrap">
                <div>
                  <span className="font-semibold text-foreground">Visualização de Impressão em Folha A4:</span>
                  <span className="text-muted-foreground ml-2">
                    {metrics.selected} etiquetas selecionadas • Layout dinâmico sem desperdício de margem
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* BOTÃO DESPACHAR AO LABORATÓRIO */}
                  <Button
                    size="sm"
                    onClick={() => setShowDispatchModal(true)}
                    disabled={metrics.selected === 0}
                    className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5 font-semibold"
                    title="Lança as amostras selecionadas como remessa oficial enviada ao laboratório"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span>Lançar Envio ao Lab</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveBatch(true)}
                    disabled={isSavingBatch || metrics.selected === 0}
                    className="h-8 px-3 text-xs gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    title="Salva este lote de emissão com os dados da área no histórico"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSavingBatch ? "Salvando..." : "Salvar no Histórico"}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handlePrintLabels}
                    className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir Agora
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="h-8 px-3 text-xs gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isGeneratingPdf ? "Gerando..." : "Baixar PDF"}
                  </Button>
                </div>
              </div>

              {/* Container Imprimível das Etiquetas */}
              <div
                id="printable-sample-labels-root"
                ref={printContentRef}
                className="print-sample-labels bg-white text-black p-4 border rounded-md shadow-xs max-h-[550px] overflow-y-auto"
              >
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-sample-labels-root, #printable-sample-labels-root * {
                      visibility: visible !important;
                    }
                    #printable-sample-labels-root {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      max-height: none !important;
                      overflow: visible !important;
                      padding: 4mm !important;
                      border: none !important;
                      box-shadow: none !important;
                    }
                    .label-card {
                      break-inside: avoid !important;
                      page-break-inside: avoid !important;
                    }
                  }
                `}</style>

                {selectedSamplesList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    Nenhuma etiqueta selecionada para impressão. Volte na aba de importação e marque as amostras.
                  </div>
                ) : (
                  /* Grade de Etiquetas Dinâmica Otimizada para Folha A4 (3 colunas, margem compacta) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {selectedSamplesList.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="label-card border border-black rounded p-2.5 bg-white text-black flex flex-col justify-between text-[11px] leading-tight min-h-[110px]"
                      >
                        {/* Linha 1: Remetente / Empresa */}
                        <div className="border-b border-gray-400 pb-1 mb-1 flex items-center justify-between">
                          <span className="font-bold text-[10px] uppercase truncate tracking-tight">
                            {labelSender}
                          </span>
                          <span className="text-[9px] text-gray-700 font-semibold uppercase">
                            Etiqueta Solo
                          </span>
                        </div>

                        {/* Linha 2: Destaque da Amostra e Determinação */}
                        <div className="flex items-center justify-between bg-gray-100 rounded px-1.5 py-1 my-0.5 border border-gray-300">
                          <div>
                            <span className="text-[9px] text-gray-600 block uppercase font-bold">Amostra:</span>
                            <span className="text-base font-black tracking-tight">{s.sampleNumber}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-gray-600 block uppercase font-bold">Determinar:</span>
                            <span className="text-xs font-bold text-gray-900">{s.analysisType}</span>
                          </div>
                        </div>

                        {/* Linha 3: Informações do Produtor e Talhão */}
                        <div className="space-y-0.5 text-[10px] pt-1">
                          <div className="truncate">
                            <strong className="text-gray-700">Nome:</strong> {labelCustomerName || "Não informado"}
                          </div>
                          <div className="truncate">
                            <strong className="text-gray-700">Prop/Talhão:</strong> {areaInfo.propTalhao}
                          </div>
                          <div className="flex justify-between text-[9px] text-gray-800 pt-0.5 border-t border-gray-200">
                            <span><strong>Prof:</strong> {s.depth}</span>
                            <span><strong>L:</strong> {areaInfo.lot}</span>
                            <span><strong>Matr:</strong> {areaInfo.registration}</span>
                            <span><strong>Área:</strong> {areaInfo.hectares} ha</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ABA 3: HISTÓRICO DE LOTES SALVOS & RETOMADA DAS NÃO ENVIADAS */}
            <TabsContent value="history" className="space-y-4 mt-3">
              <div className="flex items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  <span className="font-semibold text-foreground">
                    Histórico de Emissões Salvas ({savedBatches.length})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadSavedBatches}
                  className="h-7 text-xs gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Atualizar
                </Button>
              </div>

            {loadingBatches ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                Carregando histórico de lotes emitidos...
              </div>
            ) : savedBatches.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/10 text-muted-foreground text-xs space-y-2">
                <History className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                <p className="font-medium text-sm text-foreground">Nenhum lote salvo encontrado.</p>
                <p className="max-w-md mx-auto text-[11px]">
                  Ao exportar o CSV ou imprimir etiquetas, o lote é registrado automaticamente com a lista de amostras emitidas e as pendentes restantes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedBatches.map((batch) => {
                  const hasPending = Number(batch.pending_count) > 0;
                  const dateStr = batch.created_at
                    ? new Date(batch.created_at).toLocaleString("pt-BR")
                    : "Data N/A";
                  const isExpanded = selectedBatchDetails?.id === batch.id;

                  return (
                    <div
                      key={batch.id}
                      className="border rounded-lg bg-card p-3.5 space-y-2.5 shadow-2xs hover:border-indigo-300 transition-colors"
                    >
                      {/* Topo do Lote */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {batch.farm_name || "Fazenda"} - {batch.plot_name || "Talhão"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              • {dateStr}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>Resp: <strong>{batch.responsible_name || batch.client_name || "N/A"}</strong></span>
                            {batch.responsible_cpf && (
                              <span className="ml-2 font-mono text-[10px]">CPF: {batch.responsible_cpf}</span>
                            )}
                            <span className="ml-2">| Remetente: {batch.sender || "PRECIZA"}</span>
                          </div>
                        </div>

                        {/* Badges do Lote */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
                            ✓ {batch.emitted_count} emitidas
                          </Badge>
                          {hasPending ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-xs font-semibold">
                              ⏳ {batch.pending_count} restantes / não enviadas
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                              Grade 100% emitida
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Total: {batch.total_samples_count}
                          </Badge>
                        </div>
                      </div>

                      {/* Informações Complementares da Área */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                        <div>
                          <span>Área:</span> <strong className="text-foreground">{batch.hectares || "-"} ha</strong>
                        </div>
                        <div>
                          <span>Lote / Matrícula:</span> <strong className="text-foreground">{batch.lot || "-"} / {batch.registration || "-"}</strong>
                        </div>
                        <div>
                          <span>Município/UF:</span> <strong className="text-foreground">{batch.city_state || "-"}</strong>
                        </div>
                        <div>
                          <span>Operador / Usuário:</span> <strong className="text-foreground">{batch.user_name || "Sistema"}</strong>
                        </div>
                      </div>

                      {/* Ações do Lote */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* BOTÃO MAIS IMPORTANTE: RETOMAR AS NÃO ENVIADAS */}
                          {hasPending && (
                            <Button
                              size="sm"
                              onClick={() => handleLoadPendingFromBatch(batch)}
                              className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1 font-semibold"
                              title="Carrega diretamente as amostras não enviadas deste lote para emitir na próxima coleta"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Emitir Restantes Não Enviadas ({batch.pending_count})</span>
                            </Button>
                          )}

                          {/* BOTÃO LANÇAR NO LABORATÓRIO */}
                          <Button
                            size="sm"
                            onClick={() => handleOpenDispatchForSavedBatch(batch)}
                            className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1 font-semibold"
                            title="Lança as amostras deste lote como remessa enviada ao laboratório no módulo de análises"
                          >
                            <FlaskConical className="h-3.5 w-3.5" />
                            <span>Lançar no Lab</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBatchDetails(isExpanded ? null : batch)}
                            className="h-7 text-xs gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{isExpanded ? "Ocultar Amostras" : "Ver Amostras Deste Lote"}</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReexportBatchCSV(batch)}
                            className="h-7 text-xs gap-1 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                            title="Baixar novamente o CSV de 10 colunas como foi gerado neste lote"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Baixar CSV</span>
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setBatchIdToDelete(batch.id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1 px-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Excluir</span>
                        </Button>
                      </div>

                      {/* Tabela Expandida de Amostras do Lote */}
                      {isExpanded && (
                        <div className="mt-3 p-3 bg-muted/20 border rounded-md space-y-2 animate-fade-in">
                          <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                            <span>Amostras Emitidas Neste Lote ({batch.samples?.length || 0}):</span>
                            <span className="text-[11px] text-muted-foreground">
                              {batch.pending_samples?.length || 0} deixadas para outra coleta
                            </span>
                          </div>
                          <div className="max-h-48 overflow-y-auto border rounded bg-background">
                            <Table className="w-full text-xs">
                              <TableHeader className="bg-muted/50 sticky top-0">
                                <TableRow>
                                  <TableHead className="w-16">Amostra</TableHead>
                                  <TableHead>Determinar</TableHead>
                                  <TableHead className="w-24">Profundidade</TableHead>
                                  <TableHead>Nome Original TrackMaker</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(batch.samples || []).map((s: any, idx: number) => (
                                  <TableRow key={idx}>
                                    <TableCell className="font-bold py-1.5">{s.sampleNumber}</TableCell>
                                    <TableCell className="py-1.5">
                                      <Badge variant="outline" className="text-[10px]">
                                        {s.analysisType}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-1.5">{s.depth}</TableCell>
                                    <TableCell className="py-1.5 text-muted-foreground">{s.originalName}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </TabsContent>
          </Tabs>

          {/* 3. RODAPÉ COM AÇÕES DE EXPORTAÇÃO E DESPACHO */}
          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-3 border-t mt-3">
            <div className="text-xs text-muted-foreground">
              {metrics.selected > 0 ? (
                <span>
                  <strong>{metrics.selected}</strong> etiquetas selecionadas •{" "}
                  <strong>{metrics.pending}</strong> restantes
                </span>
              ) : (
                <span>Nenhuma amostra selecionada.</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>

              {/* Botão Salvar Lote */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSaveBatch(true)}
                disabled={metrics.selected === 0 || isSavingBatch}
                className="text-xs gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                title="Salva o lote e o histórico de emissão no banco de dados"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Lote</span>
              </Button>

              {/* Botão Exportar CSV (1 CSV por Talhão) */}
              <Button
                type="button"
                size="sm"
                onClick={handleExportCSV}
                disabled={metrics.selected === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                title="Exportar arquivo CSV com as 10 colunas oficiais do laboratório e salvar no histórico"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exportar CSV por Talhão</span>
              </Button>

              {/* Botão Imprimir / Visualizar Etiquetas */}
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setActiveTab("preview");
                }}
                disabled={metrics.selected === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 text-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Etiquetas (PDF)</span>
              </Button>

              {/* BOTÃO DESPACHAR / LANÇAR NO LABORATÓRIO */}
              <Button
                type="button"
                size="sm"
                onClick={() => setShowDispatchModal(true)}
                disabled={metrics.selected === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
                title="Lançar as amostras selecionadas como remessa enviada ao laboratório no módulo de análises e atualizar o pedido"
              >
                <FlaskConical className="h-4 w-4" />
                <span>Lançar Análises Enviadas ({metrics.selected})</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUB-DIALOG DE DESPACHO AO LABORATÓRIO */}
      {showDispatchModal && (
        <Dialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
          <DialogContent className="max-w-lg p-5">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <FlaskConical className="h-5 w-5 text-purple-600" />
                Lançar Remessa ao Laboratório a partir das Etiquetas
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Registra o envio oficial das amostras emitidas para o laboratório, atualizando os contadores do pedido e a lista de análises.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Resumo das Amostras que serão lançadas */}
              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-900 text-xs">Amostras a Despachar:</span>
                  <Badge className="bg-purple-700 text-white font-bold text-xs">
                    Total: {analysisSummary.total} amostras
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {Object.entries(analysisSummary.counts).map(([type, qty]) => (
                    <div key={type} className="p-2 bg-white rounded border border-purple-100 flex flex-col justify-between">
                      <span className="text-[10px] text-muted-foreground font-semibold">{type}</span>
                      <span className="text-sm font-bold text-purple-900">{qty} amostras</span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-purple-700 italic">
                  Área: {areaInfo.propTalhao} ({areaInfo.hectares} ha)
                </div>
              </div>

              {/* Formulário de Envio */}
              <div className="space-y-3">
                {/* Laboratório */}
                <div>
                  <Label className="text-xs font-semibold">Laboratório de Destino:</Label>
                  <Select value={dispatchLaboratory} onValueChange={setDispatchLaboratory}>
                    <SelectTrigger className="h-9 text-xs mt-1 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_LABORATORIES.map((lab) => (
                        <SelectItem key={lab.id} value={lab.name}>
                          {lab.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Data do Envio */}
                  <div>
                    <Label className="text-xs font-semibold">Data do Envio:</Label>
                    <Input
                      type="date"
                      value={dispatchDate}
                      onChange={(e) => setDispatchDate(e.target.value)}
                      className="h-9 text-xs mt-1 bg-background"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <Label className="text-xs font-semibold">Status do Lançamento:</Label>
                    <Select value={dispatchStatus} onValueChange={setDispatchStatus}>
                      <SelectTrigger className="h-9 text-xs mt-1 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enviado">Enviado (Em trânsito)</SelectItem>
                        <SelectItem value="Pendente">Pendente (Aguardando envio)</SelectItem>
                        <SelectItem value="Recebido">Recebido pelo Laboratório</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Vínculo a Pedido */}
                {farmOrders.length > 0 && (
                  <div>
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Vincular ao Pedido:</span>
                      <span className="text-[10px] text-muted-foreground">Atualiza métricas do pedido</span>
                    </Label>
                    <Select
                      value={selectedDispatchOrderId}
                      onValueChange={setSelectedDispatchOrderId}
                    >
                      <SelectTrigger className="h-9 text-xs mt-1 bg-background">
                        <SelectValue placeholder="Selecione um pedido para vincular" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmOrders.map((ord) => (
                          <SelectItem key={ord.id} value={ord.id}>
                            Pedido #{String(ord.id).slice(0, 8)} • {ord.serviceName || ord.type} ({ord.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Observações / Número de Rastreio */}
                <div>
                  <Label className="text-xs font-semibold">Observações / Número da Remessa:</Label>
                  <Input
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="Ex: Remessa 01, Lacre 1234, Rastreio Jadlog..."
                    className="h-9 text-xs mt-1 bg-background"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDispatchModal(false)}
                disabled={isDispatching}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmDispatchToLab}
                disabled={isDispatching || analysisSummary.total === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs font-semibold"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirmar Envio ao Laboratório ({analysisSummary.total})</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* AlertDialog para exclusão de lote salvo */}
      <AlertDialog open={!!batchIdToDelete} onOpenChange={(op) => !op && setBatchIdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lote do Histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente remover este lote de etiquetas do histórico de emissões? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBatch}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Excluir Lote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Farm, Plot } from "@/types/farm";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import { generateUUID } from "@/lib/utils";
import {
  enqueueOfflineOp,
  getSnapshot,
  getSyncQueue,
  isNetworkError,
  saveSnapshot,
} from "@/offline/offlineDb";

export type { Farm, Plot };

interface FarmDB {
  id: string;
  user_id?: string;
  client_id: string | null;
  name: string;
  area: number | null;
  city: string | null;
  state: string | null;
  contact: string | null;
  status: string | null;
  registration: string | null;
  lot: string | null;
  created_at?: string;
  updated_at?: string;
  client?: { id: string; name: string } | null;
  plots?: PlotDB[];
}

interface PlotDB {
  id: string;
  farm_id: string;
  name: string;
  area: number | null;
  status: string | null;
  city: string | null;
  state: string | null;
  registration: string | null;
  lot: string | null;
  created_at?: string;
  updated_at?: string;
}

const formatAreaTwoDecimals = (val: any): string => {
  if (val === null || val === undefined || val === "") return "";
  const num = typeof val === "number" ? val : parseFloat(val.toString());
  return isNaN(num) ? "" : num.toFixed(2);
};

const mapPlotFromDB = (db: PlotDB): Plot => ({
  id: db.id,
  name: db.name,
  area: formatAreaTwoDecimals(db.area),
  status: db.status || "Ativo",
  city: db.city || "",
  state: db.state || "",
  registration: db.registration || "",
  lot: db.lot || ""
});

const mapFarmFromDB = (db: any): Farm => {
  const plotsList = Array.isArray(db.plots) ? db.plots : [];
  return {
    id: db.id,
    clientId: db.client_id || db.client?.id || "",
    name: db.name,
    clientName: db.client?.name || "",
    area: formatAreaTwoDecimals(db.area),
    city: db.city || "",
    state: db.state || "",
    contact: db.contact || "",
    status: db.status || "Ativo",
    registration: db.registration || "",
    lot: db.lot || "",
    plots: plotsList.map(mapPlotFromDB)
  };
};

export const useFarms = () => {
  const { toast } = useToast();
  const queryClient = useSafeQueryClient();

  const { data: farms = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["farms"],
    queryFn: async () => {
      const mergePendingOfflineFarmsAndPlots = async (baseList: Farm[]): Promise<Farm[]> => {
        const queue = await getSyncQueue();
        const offlineFarms: Farm[] = queue
          .filter((item) => item.type === "CREATE_FARM")
          .map((item) => ({
            id: item.tempId,
            clientId: item.payload.client_id || "",
            name: item.payload.name || "Fazenda Offline",
            clientName: item.payload._clientName || "",
            area: formatAreaTwoDecimals(item.payload.area),
            city: item.payload.city || "",
            state: item.payload.state || "",
            contact: item.payload.contact || "",
            status: item.payload.status || "Ativo",
            registration: item.payload.registration || "",
            lot: item.payload.lot || "",
            responsible_name: item.payload.responsible_name || "",
            responsible_cpf: item.payload.responsible_cpf || "",
            plots: [],
          }));

        const existingIds = new Set(baseList.map((f) => f.id));
        const merged = [...offlineFarms.filter((f) => !existingIds.has(f.id)), ...baseList];

        // Anexa talhões criados offline às suas respectivas fazendas (reais ou offline)
        const pendingPlots = queue.filter((item) => item.type === "CREATE_PLOT");
        if (pendingPlots.length > 0) {
          return merged.map((farm) => {
            const extraPlots = pendingPlots
              .filter((p) => p.parentTempId === farm.id || p.payload.farm_id === farm.id)
              .map((p) => ({
                id: p.tempId,
                name: p.payload.name || "Talhão Offline",
                area: formatAreaTwoDecimals(p.payload.area),
                status: p.payload.status || "Ativo",
                city: p.payload.city || "",
                state: p.payload.state || "",
                registration: p.payload.registration || "",
                lot: p.payload.lot || "",
                responsible_name: p.payload.responsible_name || "",
                responsible_cpf: p.payload.responsible_cpf || "",
              }));
            if (extraPlots.length === 0) return farm;
            const existingPlotIds = new Set((farm.plots || []).map((pl) => pl.id));
            return {
              ...farm,
              plots: [...(farm.plots || []), ...extraPlots.filter((ep) => !existingPlotIds.has(ep.id))],
            };
          });
        }
        return merged;
      };

      try {
        const backendData = await api.get<any[]>("/farms");
        const safeList = Array.isArray(backendData) ? backendData : [];
        await saveSnapshot("farms", safeList);
        return mergePendingOfflineFarmsAndPlots(safeList.map(mapFarmFromDB));
      } catch (error: any) {
        if (isNetworkError(error)) {
          const cached = await getSnapshot<any>("farms");
          return mergePendingOfflineFarmsAndPlots(cached.map(mapFarmFromDB));
        }
        toast({
          title: "Erro ao carregar fazendas",
          description: error.message || "Erro de conexão com o servidor local.",
          variant: "destructive",
        });
        throw error;
      }
    },
  }, queryClient);

  const setFarms = useCallback(
    (updater: Farm[] | ((prev: Farm[]) => Farm[])) => {
      queryClient.setQueryData<Farm[]>(["farms"], (prev = []) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    [queryClient]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [showPlotsModal, setShowPlotsModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const [formData, setFormData] = useState<Farm>({
    id: "",
    clientId: "",
    name: "",
    clientName: "",
    area: "",
    city: "",
    state: "",
    contact: "",
    status: "Ativo",
    registration: "",
    lot: "",
    plots: []
  });

  const [plotForm, setPlotForm] = useState<Plot>({
    id: "",
    name: "",
    area: "",
    status: "Ativo",
    city: "",
    state: "",
    registration: "",
    lot: ""
  });

  const fetchFarms = async () => {
    await queryClient.invalidateQueries({ queryKey: ["farms"] });
    await refetch();
  };

  const addFarm = async (farm: Omit<Farm, 'id' | 'plots'>) => {
    const payload: Record<string, any> = {
      client_id: farm.clientId || null,
      name: farm.name,
      area: farm.area ? parseFloat(farm.area) : null,
      city: farm.city || null,
      state: farm.state || null,
      contact: farm.contact || null,
      status: farm.status || "Ativo",
      registration: farm.registration || null,
      lot: farm.lot || null,
      responsible_name: farm.responsible_name || null,
      responsible_cpf: farm.responsible_cpf || null,
    };

    const saveOffline = async () => {
      const tempId = `offline-farm-${generateUUID()}`;
      await enqueueOfflineOp({
        type: "CREATE_FARM",
        tempId,
        parentTempId: farm.clientId && farm.clientId.startsWith("offline-") ? farm.clientId : undefined,
        label: farm.name || "Nova Fazenda",
        payload,
      });
      const localFarm: Farm = {
        id: tempId,
        ...farm,
        area: formatAreaTwoDecimals(farm.area),
        plots: [],
      };
      setFarms((prev) => [localFarm, ...prev]);
      toast({
        title: "Fazenda salva no Modo Offline",
        description: `${farm.name} foi gravada localmente e já pode receber talhões e pedidos.`,
      });
      return localFarm;
    };

    if ((typeof navigator !== "undefined" && !navigator.onLine) || (farm.clientId && farm.clientId.startsWith("offline-"))) {
      return saveOffline();
    }

    try {
      const created = await api.post<any>('/farms', payload);
      await fetchFarms();
      toast({
        title: "Fazenda cadastrada",
        description: "A fazenda foi cadastrada com sucesso."
      });
      return created;
    } catch (error: any) {
      if (isNetworkError(error)) {
        return saveOffline();
      }
      toast({
        title: "Erro ao cadastrar fazenda",
        description: error.message || "Falha ao gravar no banco de dados.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateFarm = async (farm: Farm) => {
    try {
      await api.put<any>(`/farms/${farm.id}`, {
        client_id: farm.clientId || null,
        name: farm.name,
        area: farm.area ? parseFloat(farm.area) : null,
        city: farm.city || null,
        state: farm.state || null,
        contact: farm.contact || null,
        status: farm.status || "Ativo",
        registration: farm.registration || null,
        lot: farm.lot || null
      });
      await fetchFarms();
      toast({
        title: "Fazenda atualizada",
        description: "A fazenda foi atualizada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar fazenda",
        description: error.message || "Falha ao atualizar fazenda.",
        variant: "destructive"
      });
    }
  };

  const deleteFarm = async (farmId: string) => {
    try {
      await api.delete(`/farms/${farmId}`);
      await fetchFarms();
      toast({
        title: "Fazenda removida",
        description: "A fazenda foi excluída com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover fazenda",
        description: error.message || "Falha ao excluir fazenda.",
        variant: "destructive"
      });
    }
  };

  const addPlot = async (farmId: string, plot: Omit<Plot, 'id'>) => {
    const payload = {
      name: plot.name,
      area: plot.area ? parseFloat(plot.area) : null,
      status: plot.status || "Ativo",
      city: plot.city || null,
      state: plot.state || null,
      registration: plot.registration || null,
      lot: plot.lot || null,
      responsible_name: plot.responsible_name || null,
      responsible_cpf: plot.responsible_cpf || null,
    };

    const saveOffline = async () => {
      const tempId = `offline-plot-${generateUUID()}`;
      await enqueueOfflineOp({
        type: "CREATE_PLOT",
        tempId,
        parentTempId: farmId,
        label: plot.name || "Novo Talhão",
        payload: { ...payload, farm_id: farmId },
      });
      const localPlot: Plot = {
        id: tempId,
        ...plot,
        area: formatAreaTwoDecimals(plot.area),
      };
      setFarms((prev) =>
        prev.map((f) => (f.id === farmId ? { ...f, plots: [...(f.plots || []), localPlot] } : f))
      );
      if (selectedFarm?.id === farmId) {
        setSelectedFarm((prev) => (prev ? { ...prev, plots: [...prev.plots, localPlot] } : null));
      }
      toast({
        title: "Talhão salvo no Modo Offline",
        description: `${plot.name} foi adicionado localmente e será sincronizado ao retornar o sinal.`,
      });
      return localPlot;
    };

    if ((typeof navigator !== "undefined" && !navigator.onLine) || farmId.startsWith("offline-")) {
      return saveOffline();
    }

    try {
      const createdPlot = await api.post<any>(`/farms/${farmId}/plots`, payload);
      await fetchFarms();

      const mapped = mapPlotFromDB(createdPlot);
      if (selectedFarm?.id === farmId) {
        setSelectedFarm(prev => prev ? { ...prev, plots: [...prev.plots, mapped] } : null);
      }

      toast({
        title: "Talhão adicionado",
        description: "O talhão foi adicionado com sucesso."
      });
      return createdPlot;
    } catch (error: any) {
      if (isNetworkError(error)) {
        return saveOffline();
      }
      toast({
        title: "Erro ao adicionar talhão",
        description: error.message || "Falha ao salvar talhão no banco.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updatePlot = async (farmId: string, plotId: string, plot: Partial<Plot>) => {
    try {
      const updatedPlot = await api.put<any>(`/farms/plots/${plotId}`, {
        name: plot.name,
        area: plot.area ? parseFloat(parseFloat(plot.area).toFixed(2)) : null,
        status: plot.status || "Ativo",
        city: plot.city || null,
        state: plot.state || null,
        registration: plot.registration || null,
        lot: plot.lot || null
      });
      await fetchFarms();

      const mapped = mapPlotFromDB(updatedPlot);
      if (selectedFarm?.id === farmId) {
        setSelectedFarm(prev => prev ? {
          ...prev,
          plots: prev.plots.map(p => p.id === plotId ? mapped : p)
        } : null);
      }

      toast({
        title: "Talhão atualizado",
        description: "O talhão foi atualizado com sucesso."
      });
      return updatedPlot;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar talhão",
        description: error.message || "Falha ao atualizar talhão no banco.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deletePlot = async (farmId: string, plotId: string) => {
    try {
      await api.delete(`/farms/plots/${plotId}`);
      await fetchFarms();

      if (selectedFarm?.id === farmId) {
        setSelectedFarm(prev => prev ? { ...prev, plots: prev.plots.filter(p => p.id !== plotId) } : null);
      }

      toast({
        title: "Talhão removido",
        description: "O talhão foi removido com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover talhão",
        description: error.message || "Falha ao excluir talhão.",
        variant: "destructive"
      });
    }
  };

  return {
    farms,
    setFarms,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    showFarmForm,
    setShowFarmForm,
    editingFarm,
    setEditingFarm,
    showPlotsModal,
    setShowPlotsModal,
    selectedFarm,
    setSelectedFarm,
    formData,
    setFormData,
    plotForm,
    setPlotForm,
    addFarm,
    updateFarm,
    deleteFarm,
    addPlot,
    updatePlot,
    deletePlot,
    refetch: fetchFarms
  };
};

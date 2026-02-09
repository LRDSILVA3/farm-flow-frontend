import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Farm, Plot } from "@/types/farm";

export type { Farm, Plot };

interface FarmDB {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  area: number | null;
  city: string | null;
  state: string | null;
  contact: string | null;
  status: string | null;
  registration: string | null;
  lot: string | null;
  created_at: string;
  updated_at: string;
  clients: { name: string } | null;
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
  created_at: string;
  updated_at: string;
}

const mapPlotFromDB = (db: PlotDB): Plot => ({
  id: db.id,
  name: db.name,
  area: db.area?.toString() || "",
  status: db.status || "Active",
  city: db.city || "",
  state: db.state || "",
  registration: db.registration || "",
  lot: db.lot || ""
});

const mapFarmFromDB = (db: FarmDB, plots: PlotDB[] = []): Farm => ({
  id: db.id,
  clientId: db.client_id || "",
  name: db.name,
  clientName: db.clients?.name || "", // Use the joined client's name
  area: db.area?.toString() || "",
  city: db.city || "",
  state: db.state || "",
  contact: db.contact || "",
  status: db.status || "Active",
  registration: db.registration || "",
  lot: db.lot || "",
  plots: plots.filter(p => p.farm_id === db.id).map(mapPlotFromDB)
});

export const useFarms = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    clientName: "", // Updated from 'owner' to 'clientName'
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
    try {
      const { data: farmsData, error: farmsError } = await supabase
        .from("farms")
        .select("*, clients(name)") // Select all fields from farms and the name from the joined clients table
        .order("name");

      if (farmsError) throw farmsError;

      const { data: plotsData, error: plotsError } = await supabase
        .from("plots")
        .select("*");

      if (plotsError) throw plotsError;

      const mappedFarms = (farmsData || []).map(f => 
        mapFarmFromDB(f, plotsData || [])
      );
      setFarms(mappedFarms);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar fazendas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const addFarm = async (farm: Omit<Farm, 'id' | 'plots'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("farms")
        .insert({
          user_id: user.id,
          client_id: farm.clientId || null, // Use clientId
          name: farm.name,
          area: farm.area ? parseFloat(farm.area) : null,
          city: farm.city || null,
          state: farm.state || null,
          contact: farm.contact || null,
          status: farm.status || "Active",
          registration: farm.registration || null,
          lot: farm.lot || null
        })
        .select()
        .single();

      if (error) throw error;
      setFarms(prev => [...prev, mapFarmFromDB(data as unknown as FarmDB, [])]);
      toast({
        title: "Fazenda cadastrada",
        description: "A fazenda foi cadastrada com sucesso."
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar fazenda",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateFarm = async (farm: Farm) => {
    try {
      const { error } = await supabase
        .from("farms")
        .update({
          client_id: farm.clientId || null, // Use clientId
          name: farm.name,
          area: farm.area ? parseFloat(farm.area) : null,
          city: farm.city || null,
          state: farm.state || null,
          contact: farm.contact || null,
          status: farm.status || "Active",
          registration: farm.registration || null,
          lot: farm.lot || null
        })
        .eq("id", farm.id);

      if (error) throw error;
      setFarms(prev => prev.map(f => f.id === farm.id ? farm : f));
      toast({
        title: "Fazenda atualizada",
        description: "A fazenda foi atualizada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar fazenda",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addPlot = async (farmId: string, plot: Omit<Plot, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from("plots")
        .insert({
          farm_id: farmId,
          name: plot.name,
          area: plot.area ? parseFloat(plot.area) : null,
          status: plot.status || "Active",
          city: plot.city || null,
          state: plot.state || null,
          registration: plot.registration || null,
          lot: plot.lot || null
        })
        .select()
        .single();

      if (error) throw error;
      
      const newPlot = mapPlotFromDB(data);
      setFarms(prev => prev.map(f => {
        if (f.id === farmId) {
          return { ...f, plots: [...f.plots, newPlot] };
        }
        return f;
      }));
      
      if (selectedFarm?.id === farmId) {
        setSelectedFarm(prev => prev ? { ...prev, plots: [...prev.plots, newPlot] } : null);
      }
      
      toast({
        title: "Talhão adicionado",
        description: "O talhão foi adicionado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar talhão",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deletePlot = async (farmId: string, plotId: string) => {
    try {
      const { error } = await supabase
        .from("plots")
        .delete()
        .eq("id", plotId);

      if (error) throw error;
      
      setFarms(prev => prev.map(f => {
        if (f.id === farmId) {
          return { ...f, plots: f.plots.filter(p => p.id !== plotId) };
        }
        return f;
      }));
      
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
        description: error.message,
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
    addPlot,
    deletePlot,
    refetch: fetchFarms
  };
};

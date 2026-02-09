import { useRef, useEffect } from "react";
import { Farm, Plot } from "@/types/farm";

export const useFarmHandlers = (
  farms: Farm[],
  setFarms: (farms: Farm[] | ((prev: Farm[]) => Farm[])) => void,
  setEditingFarm: (farm: Farm | null) => void,
  setFormData: (farm: Farm | ((prev: Farm) => Farm)) => void,
  setShowFarmForm: (show: boolean) => void,
  setSelectedFarm: (farm: Farm | null | ((prev: Farm | null) => Farm | null)) => void,
  setShowPlotsModal: (show: boolean) => void,
  editingFarm: Farm | null,
  formData: Farm,
  setPlotForm: (plot: Plot) => void,
  addFarm?: (farm: Omit<Farm, 'id' | 'plots'>) => Promise<any>,
  updateFarm?: (farm: Farm) => Promise<void>,
  addPlot?: (farmId: string, plot: Omit<Plot, 'id'>) => Promise<void>,
  deletePlot?: (farmId: string, plotId: string) => Promise<void>
) => {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData(farm);
    setShowFarmForm(true);
  };

  const handleViewPlots = (farm: Farm) => {
    setSelectedFarm(farm);
    setShowPlotsModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFarm) {
      if (updateFarm) {
        await updateFarm(formData);
      }
    } else {
      if (addFarm) {
        await addFarm(formData);
      }
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
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
    setEditingFarm(null);
    setShowFarmForm(false);
  };

  const handleInputChange = (field: keyof Farm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlot = async (farmId: string, plotForm: Plot) => {
    if (addPlot) {
      await addPlot(farmId, plotForm);
    }

    setPlotForm({
      id: "",
      name: "",
      area: "",
      status: "Ativo",
      city: "",
      state: "",
      registration: "",
      lot: ""
    });
  };

  const handleDeletePlot = async (farmId: string, plotId: string) => {
    if (deletePlot) {
      await deletePlot(farmId, plotId);
    }

    if (editingFarm && editingFarm.id === farmId) {
      setFormData(prev => ({
        ...prev,
        plots: prev.plots.filter(t => t.id !== plotId)
      }));
    }
  };

  return {
    handleEdit,
    handleViewPlots,
    handleSubmit,
    resetForm,
    handleInputChange,
    handleAddPlot,
    handleDeletePlot
  };
};

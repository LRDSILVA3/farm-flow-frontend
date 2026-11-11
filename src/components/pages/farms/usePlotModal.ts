
import { useState, useEffect } from "react";
import { Plot } from "@/types/farm";
import { useToast } from "@/hooks/use-toast";

export const usePlotsModal = (
  onAddPlot: (farmId: string) => void,
  plotForm: Plot,
  setPlotForm: (plot: Plot) => void,
  autoOpenForm?: boolean
) => {
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const { toast } = useToast();

  // Abre automaticamente o formulário se solicitado
  useEffect(() => {
    if (autoOpenForm) {
      setShowPlotForm(true);
    }
  }, [autoOpenForm]);

  const handleAddPlot = (e: React.FormEvent, farmId: string) => {
    e.preventDefault();
    onAddPlot(farmId);
    resetForm();
  };

  const handleEditPlot = (plot: Plot) => {
    setEditingPlot(plot);
    setPlotForm(plot);
    setShowPlotForm(true);
  };

  const clearPlotFields = () => {
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
    setEditingPlot(null);
  };

  const handleOpenNewPlot = () => {
    clearPlotFields();
    setShowPlotForm(true);
  };

  const handleCancel = () => {
    clearPlotFields();
    setShowPlotForm(false);
  };

  const resetForm = () => {
    clearPlotFields();
    setShowPlotForm(false);
  };

  return {
    showPlotForm,
    setShowPlotForm,
    editingPlot,
    handleAddPlot,
    handleEditPlot,
    handleOpenNewPlot,
    handleCancel
  };
};

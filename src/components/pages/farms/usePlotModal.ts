
import { useState, useEffect } from "react";
import { Plot } from "../FarmPage";
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

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
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
    setShowPlotForm(false);
    setEditingPlot(null);
  };

  return {
    showPlotForm,
    setShowPlotForm,
    editingPlot,
    handleAddPlot,
    handleEditPlot,
    handleCancel
  };
};

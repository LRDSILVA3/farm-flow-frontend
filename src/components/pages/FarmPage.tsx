import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { FarmsTable } from "./farms/FarmTable";
import { FarmForm } from "./farms/FarmForm";
import { PlotsModal } from "./farms/PlotsModal";
import { AddPlotModal } from "./farms/AddPlotModal";
import { FarmPageHeader } from "./farms/FarmPageHeader";
import { useFarms } from "@/hooks/useFarms";
import { useFarmHandlers } from "./farms/usePlotHandlers";





const FarmsPage = () => {
  const {
    farms,
    setFarms,
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
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
  } = useFarms();

  useEffect(() => {
    return () => {
      setShowFarmForm(false);
      setShowPlotsModal(false);
      setEditingFarm(null);
      setSelectedFarm(null);
    };
  }, [setShowFarmForm, setShowPlotsModal, setEditingFarm, setSelectedFarm]);

  const [searchTerm, setSearchTerm] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);

  const {
    handleEdit,
    handleViewPlots,
    handleSubmit,
    resetForm,
    handleInputChange,
    handleAddPlot,
    handleDeletePlot
  } = useFarmHandlers(
    farms,
    setFarms,
    setEditingFarm,
    setFormData,
    setShowFarmForm,
    setSelectedFarm,
    setShowPlotsModal,
    editingFarm,
    formData,
    setPlotForm,
    addFarm,
    updateFarm,
    addPlot,
    deletePlot
  );

  const handleAddPlotWrapper = (farmId: string) => {
    handleAddPlot(farmId, plotForm);
  };

  const handleAddPlotFromForm = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    if (farm) {
      setSelectedFarm(farm);
      setShowAddPlotModal(true);
    }
  };

  const locations = Array.from(new Set(farms.map(f => `${f.city} - ${f.state}`))).sort();

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (farm.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const farmLocation = `${farm.city} - ${farm.state}`;
    const matchesCidadeEstado = !cidadeEstadoFilter || cidadeEstadoFilter === "all" || farmLocation === cidadeEstadoFilter;
    
    return matchesSearch && matchesCidadeEstado;
  });

  return (
    <div className="space-y-6">
      <FarmPageHeader onNewFarm={() => setShowFarmForm(true)} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Fazendas</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar fazenda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={cidadeEstadoFilter} onValueChange={setCidadeEstadoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Cidade/Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as localizações</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FarmsTable
            farms={filteredFarms}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onEdit={handleEdit}
            onViewPlots={handleViewPlots}
          />
        </CardContent>
      </Card>

      <FarmForm
        open={showFarmForm}
        onOpenChange={setShowFarmForm}
        editingFarm={editingFarm}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        onDeletePlot={handleDeletePlot}
        onAddPlot={handleAddPlotFromForm}
      />

      <PlotsModal
        open={showPlotsModal}
        onOpenChange={setShowPlotsModal}
        farm={selectedFarm}
        plotForm={plotForm}
        setPlotForm={setPlotForm}
        onAddPlot={handleAddPlotWrapper}
        onDeletePlot={handleDeletePlot}
      />

      <AddPlotModal
        open={showAddPlotModal}
        onOpenChange={setShowAddPlotModal}
        farm={selectedFarm}
        plotForm={plotForm}
        setPlotForm={setPlotForm}
        onAddPlot={handleAddPlotWrapper}
      />
    </div>
  );
};

export default FarmsPage;

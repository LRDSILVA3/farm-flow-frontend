import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { FazendasTable } from "./farms/FarmTable";
import { FazendaForm } from "./farms/FarmForm";
import { TalhoesModal } from "./farms/PlotsModal";
import { AddTalhaoModal } from "./farms/AddPlotModal";
import { FazendasPageHeader } from "./farms/FarmPageHeader";
import { useFarms, Farm, Plot } from "@/hooks/useFarms";
import { useFazendaHandlers } from "./farms/usePlotHandlers";

export interface Talhao {
  id: string;
  nome: string;
  area: string;
  status: string;
  cidade: string;
  estado: string;
  matricula: string;
  lote: string;
}

export interface Fazenda {
  id: string;
  nome: string;
  proprietario: string;
  area: string;
  cidade: string;
  estado: string;
  contato: string;
  status: string;
  matricula: string;
  lote: string;
  talhoes: Talhao[];
}

// Map between English and Portuguese interfaces
const mapFarmToFazenda = (farm: Farm): Fazenda => ({
  id: farm.id,
  nome: farm.name,
  proprietario: farm.owner,
  area: farm.area,
  cidade: farm.city,
  estado: farm.state,
  contato: farm.contact,
  status: farm.status,
  matricula: farm.registration,
  lote: farm.lot,
  talhoes: farm.plots.map(p => ({
    id: p.id,
    nome: p.name,
    area: p.area,
    status: p.status,
    cidade: p.city,
    estado: p.state,
    matricula: p.registration,
    lote: p.lot
  }))
});

const mapFazendaToFarm = (fazenda: Fazenda): Farm => ({
  id: fazenda.id,
  name: fazenda.nome,
  owner: fazenda.proprietario,
  area: fazenda.area,
  city: fazenda.cidade,
  state: fazenda.estado,
  contact: fazenda.contato,
  status: fazenda.status,
  registration: fazenda.matricula,
  lot: fazenda.lote,
  plots: fazenda.talhoes.map(t => ({
    id: t.id,
    name: t.nome,
    area: t.area,
    status: t.status,
    city: t.cidade,
    state: t.estado,
    registration: t.matricula,
    lot: t.lote
  }))
});

const FazendasPage = () => {
  const farmHook = useFarms();
  
  // Map to Portuguese interface for backwards compatibility
  const fazendas = farmHook.farms.map(mapFarmToFazenda);
  const setFazendas = (fazendasOrFn: Fazenda[] | ((prev: Fazenda[]) => Fazenda[])) => {
    if (typeof fazendasOrFn === 'function') {
      farmHook.setFarms(prev => {
        const prevFazendas = prev.map(mapFarmToFazenda);
        const newFazendas = fazendasOrFn(prevFazendas);
        return newFazendas.map(mapFazendaToFarm);
      });
    } else {
      farmHook.setFarms(fazendasOrFn.map(mapFazendaToFarm));
    }
  };
  
  const showFazendaForm = farmHook.showFarmForm;
  const setShowFazendaForm = farmHook.setShowFarmForm;
  const editingFazenda = farmHook.editingFarm ? mapFarmToFazenda(farmHook.editingFarm) : null;
  const setEditingFazenda = (f: Fazenda | null) => farmHook.setEditingFarm(f ? mapFazendaToFarm(f) : null);
  const showTalhoesModal = farmHook.showPlotsModal;
  const setShowTalhoesModal = farmHook.setShowPlotsModal;
  const selectedFazenda = farmHook.selectedFarm ? mapFarmToFazenda(farmHook.selectedFarm) : null;
  const setSelectedFazenda = (f: Fazenda | null | ((prev: Fazenda | null) => Fazenda | null)) => {
    if (typeof f === 'function') {
      farmHook.setSelectedFarm(prev => {
        const prevFazenda = prev ? mapFarmToFazenda(prev) : null;
        const newFazenda = f(prevFazenda);
        return newFazenda ? mapFazendaToFarm(newFazenda) : null;
      });
    } else {
      farmHook.setSelectedFarm(f ? mapFazendaToFarm(f) : null);
    }
  };
  const formData = mapFarmToFazenda(farmHook.formData);
  const setFormData = (f: Fazenda | ((prev: Fazenda) => Fazenda)) => {
    if (typeof f === 'function') {
      farmHook.setFormData(prev => mapFazendaToFarm(f(mapFarmToFazenda(prev))));
    } else {
      farmHook.setFormData(mapFazendaToFarm(f));
    }
  };
  
  const talhaoForm: Talhao = {
    id: farmHook.plotForm.id,
    nome: farmHook.plotForm.name,
    area: farmHook.plotForm.area,
    status: farmHook.plotForm.status,
    cidade: farmHook.plotForm.city,
    estado: farmHook.plotForm.state,
    matricula: farmHook.plotForm.registration,
    lote: farmHook.plotForm.lot
  };
  const setTalhaoForm = (t: Talhao) => {
    farmHook.setPlotForm({
      id: t.id,
      name: t.nome,
      area: t.area,
      status: t.status,
      city: t.cidade,
      state: t.estado,
      registration: t.matricula,
      lot: t.lote
    });
  };

  useEffect(() => {
    return () => {
      setShowFazendaForm(false);
      setShowTalhoesModal(false);
      farmHook.setEditingFarm(null);
      farmHook.setSelectedFarm(null);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");
  const [showAddTalhaoModal, setShowAddTalhaoModal] = useState(false);

  const addFazenda = async (fazenda: Omit<Fazenda, 'id' | 'talhoes'>) => {
    return farmHook.addFarm({
      name: fazenda.nome,
      owner: fazenda.proprietario,
      area: fazenda.area,
      city: fazenda.cidade,
      state: fazenda.estado,
      contact: fazenda.contato,
      status: fazenda.status,
      registration: fazenda.matricula,
      lot: fazenda.lote
    });
  };
  
  const updateFazenda = async (fazenda: Fazenda) => {
    return farmHook.updateFarm(mapFazendaToFarm(fazenda));
  };
  
  const addTalhao = async (fazendaId: string, talhao: Omit<Talhao, 'id'>) => {
    return farmHook.addPlot(fazendaId, {
      name: talhao.nome,
      area: talhao.area,
      status: talhao.status,
      city: talhao.cidade,
      state: talhao.estado,
      registration: talhao.matricula,
      lot: talhao.lote
    });
  };
  
  const deleteTalhao = async (fazendaId: string, talhaoId: string) => {
    return farmHook.deletePlot(fazendaId, talhaoId);
  };

  const {
    handleEdit,
    handleViewTalhoes,
    handleSubmit,
    resetForm,
    handleInputChange,
    handleAddTalhao,
    handleDeleteTalhao
  } = useFazendaHandlers(
    fazendas,
    setFazendas,
    setEditingFazenda,
    setFormData,
    setShowFazendaForm,
    setSelectedFazenda,
    setShowTalhoesModal,
    editingFazenda,
    formData,
    setTalhaoForm,
    addFazenda,
    updateFazenda,
    addTalhao,
    deleteTalhao
  );

  const handleAddTalhaoWrapper = (fazendaId: string) => {
    handleAddTalhao(fazendaId, talhaoForm);
  };

  const handleAddTalhaoFromForm = (fazendaId: string) => {
    const fazenda = fazendas.find(f => f.id === fazendaId);
    if (fazenda) {
      setSelectedFazenda(fazenda);
      setShowAddTalhaoModal(true);
    }
  };

  const localizacoes = Array.from(new Set(fazendas.map(f => `${f.cidade} - ${f.estado}`))).sort();

  const filteredFazendas = fazendas.filter(fazenda => {
    const matchesSearch = fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fazenda.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fazenda.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fazenda.estado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const fazendaLocation = `${fazenda.cidade} - ${fazenda.estado}`;
    const matchesCidadeEstado = !cidadeEstadoFilter || cidadeEstadoFilter === "all" || fazendaLocation === cidadeEstadoFilter;
    
    return matchesSearch && matchesCidadeEstado;
  });

  return (
    <div className="space-y-6">
      <FazendasPageHeader onNewFazenda={() => setShowFazendaForm(true)} />

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
                  {localizacoes.map((localizacao) => (
                    <SelectItem key={localizacao} value={localizacao}>
                      {localizacao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FazendasTable
            fazendas={filteredFazendas}
            currentPage={farmHook.currentPage}
            itemsPerPage={farmHook.itemsPerPage}
            onPageChange={farmHook.setCurrentPage}
            onItemsPerPageChange={farmHook.setItemsPerPage}
            onEdit={handleEdit}
            onViewTalhoes={handleViewTalhoes}
          />
        </CardContent>
      </Card>

      <FazendaForm
        open={showFazendaForm}
        onOpenChange={setShowFazendaForm}
        editingFazenda={editingFazenda}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        onDeleteTalhao={handleDeleteTalhao}
        onAddTalhao={handleAddTalhaoFromForm}
      />

      <TalhoesModal
        open={showTalhoesModal}
        onOpenChange={setShowTalhoesModal}
        fazenda={selectedFazenda}
        talhaoForm={talhaoForm}
        setTalhaoForm={setTalhaoForm}
        onAddTalhao={handleAddTalhaoWrapper}
        onDeleteTalhao={handleDeleteTalhao}
      />

      <AddTalhaoModal
        open={showAddTalhaoModal}
        onOpenChange={setShowAddTalhaoModal}
        fazenda={selectedFazenda}
        talhaoForm={talhaoForm}
        setTalhaoForm={setTalhaoForm}
        onAddTalhao={handleAddTalhaoWrapper}
      />
    </div>
  );
};

export default FazendasPage;

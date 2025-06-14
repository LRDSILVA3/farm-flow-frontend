import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FazendasTable } from "./fazendas/FazendasTable";
import { FazendaForm } from "./fazendas/FazendaForm";
import { TalhoesModal } from "./fazendas/TalhoesModal";
import { AddTalhaoModal } from "./fazendas/AddTalhaoModal";
import { FazendasPageHeader } from "./fazendas/FazendasPageHeader";
import { useFazendas } from "./fazendas/useFazendas";
import { useFazendaHandlers } from "./fazendas/useFazendaHandlers";

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
  localizacao: string;
  contato: string;
  status: string;
  matricula: string;
  lote: string;
  talhoes: Talhao[];
}

const FazendasPage = () => {
  const {
    fazendas,
    setFazendas,
    showFazendaForm,
    setShowFazendaForm,
    editingFazenda,
    setEditingFazenda,
    showTalhoesModal,
    setShowTalhoesModal,
    selectedFazenda,
    setSelectedFazenda,
    formData,
    setFormData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    talhaoForm,
    setTalhaoForm
  } = useFazendas();

  // Estado para controlar o modal de adicionar talhão
  const [showAddTalhaoModal, setShowAddTalhaoModal] = useState(false);

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
    setTalhaoForm
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

  return (
    <div className="space-y-6">
      <FazendasPageHeader onNewFazenda={() => setShowFazendaForm(true)} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fazendas</CardTitle>
        </CardHeader>
        <CardContent>
          <FazendasTable
            fazendas={fazendas}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
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

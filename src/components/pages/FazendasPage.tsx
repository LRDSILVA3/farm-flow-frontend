import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FazendasTable } from "./fazendas/FazendasTable";
import { FazendaForm } from "./fazendas/FazendaForm";
import { TalhoesModal } from "./fazendas/TalhoesModal";
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

  // Novo estado para controlar se o modal de talhões deve mostrar apenas o formulário
  const [talhoesFormOnly, setTalhoesFormOnly] = useState(false);

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
      setTalhoesFormOnly(true); // Define que deve mostrar apenas o formulário
      setShowTalhoesModal(true);
    }
  };

  const handleViewTalhoesWrapper = (fazenda: Fazenda) => {
    setTalhoesFormOnly(false); // Define que deve mostrar a listagem normal
    handleViewTalhoes(fazenda);
  };

  const handleTalhoesModalClose = (open: boolean) => {
    setShowTalhoesModal(open);
    if (!open) {
      setTalhoesFormOnly(false); // Reset do modo quando fechar
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
            onViewTalhoes={handleViewTalhoesWrapper}
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
        onOpenChange={handleTalhoesModalClose}
        fazenda={selectedFazenda}
        talhaoForm={talhaoForm}
        setTalhaoForm={setTalhaoForm}
        onAddTalhao={handleAddTalhaoWrapper}
        onDeleteTalhao={handleDeleteTalhao}
        formOnly={talhoesFormOnly}
      />
    </div>
  );
};

export default FazendasPage;
